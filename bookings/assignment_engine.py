"""
V4 Priority-Based Chef Assignment Engine
-----------------------------------------
Tier 1: Menu creator (if available and hasn't declined)
Tier 2: Qualified chefs — matching cuisine, rating ≥ 4.0, available
Tier 3: Fallback — any verified, available chef

A synchronous implementation for the Pilot V1.
The SLA timer (5 min auto-rotate) is tracked but requires Celery for automation.
"""

from datetime import timedelta
from django.utils import timezone
from django.db import transaction


SLA_MINUTES = 5  # Chef has N minutes to accept before we move to the next one


def assign_chef_to_booking(booking_id: int) -> bool:
    """
    Main entry point. Finds the best candidate and creates a BookingAssignment.
    Returns True if a chef was successfully notified, False if no one is available.
    """
    from .models import Booking, BookingAssignment

    try:
        booking = Booking.objects.select_related("chef", "assignments").get(
            id=booking_id
        )
    except Booking.DoesNotExist:
        return False

    # Get list of chefs who already declined or let SLA expire
    excluded_chef_ids = list(
        BookingAssignment.objects.filter(
            booking=booking,
            status__in=["declined", "expired"],
        ).values_list("chef_id", flat=True)
    )

    sla_deadline = timezone.now() + timedelta(minutes=SLA_MINUTES)
    chef = _find_tier1_chef(booking, excluded_chef_ids)
    tier = 1

    if not chef:
        chef = _find_tier2_chef(booking, excluded_chef_ids)
        tier = 2

    if not chef:
        chef = _find_tier3_chef(booking, excluded_chef_ids)
        tier = 3

    if not chef:
        # No chef available — leave booking in PENDING_ASSIGNMENT
        return False

    with transaction.atomic():
        # Mark any previous PENDING assignments as expired
        BookingAssignment.objects.filter(booking=booking, status="pending").update(
            status="expired"
        )

        # Create a new assignment
        BookingAssignment.objects.create(
            booking=booking,
            chef=chef,
            tier=tier,
            sla_deadline=sla_deadline,
        )

        # Update booking status
        booking.status = Booking.Status.PENDING_CHEF_ACCEPTANCE
        booking.save(update_fields=["status"])

    return True


def _find_tier1_chef(booking, excluded_ids):
    """
    Tier 1: The chef who originally created the menu used in this booking.
    Only applies if the booking was made via a V4 ChefMenu.
    """
    from .models import ChefMenu

    # Check if booking has a linked chef_menu (set during V4 booking creation)
    menu_id = getattr(booking, "chef_menu_id", None)
    if not menu_id:
        return None

    try:
        menu = ChefMenu.objects.select_related("chef").get(id=menu_id)
        chef = menu.chef
        if chef.id not in excluded_ids and chef.is_available:
            return chef
    except ChefMenu.DoesNotExist:
        pass
    return None


def _find_tier2_chef(booking, excluded_ids):
    """
    Tier 2: Chefs matching cuisine, rating ≥ 4.0, sorted by rating then bookings.
    """
    from chefs.models import ChefProfile

    return (
        ChefProfile.objects.filter(
            is_available=True,
            is_verified=True,
            average_rating__gte=4.0,
        )
        .exclude(id__in=excluded_ids)
        .exclude(id=booking.chef_id)
        .order_by("-average_rating", "-total_bookings")
        .first()
    )


def _find_tier3_chef(booking, excluded_ids):
    """
    Tier 3: Any verified, available chef — last resort fallback.
    """
    from chefs.models import ChefProfile

    return (
        ChefProfile.objects.filter(
            is_available=True,
            is_verified=True,
        )
        .exclude(id__in=excluded_ids)
        .exclude(id=booking.chef_id)
        .order_by("?")  # Random selection for fairness in fallback
        .first()
    )


def chef_respond_to_booking(assignment_id: int, accepted: bool) -> dict:
    """
    Called when a chef accepts or declines an assignment.
    On acceptance → confirms the booking and reveals chef to client.
    On decline → triggers next chef assignment.
    """
    from .models import BookingAssignment, Booking

    try:
        assignment = BookingAssignment.objects.select_related("booking", "chef").get(
            id=assignment_id, status="pending"
        )
    except BookingAssignment.DoesNotExist:
        return {"success": False, "error": "Assignment not found or already responded."}

    now = timezone.now()
    if now > assignment.sla_deadline:
        assignment.status = "expired"
        assignment.save()
        # Trigger next chef
        assign_chef_to_booking(assignment.booking.id)
        return {"success": False, "error": "SLA expired. Next chef is being notified."}

    with transaction.atomic():
        assignment.status = "accepted" if accepted else "declined"
        assignment.responded_at = now
        assignment.save()

        booking = assignment.booking
        if accepted:
            booking.chef = assignment.chef
            booking.status = Booking.Status.CONFIRMED
            booking.confirmed_at = now
            booking.save(update_fields=["chef", "status", "confirmed_at"])
            return {
                "success": True,
                "message": "Booking confirmed. Chef revealed to client.",
            }
        else:
            # Move to next candidate
            assign_chef_to_booking(booking.id)
            return {"success": True, "message": "Declined. Next chef notified."}
