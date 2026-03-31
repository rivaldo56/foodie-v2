from django.core.mail import send_mail
from django.conf import settings
from django.template.loader import render_to_string
from django.utils.html import strip_tags
import logging

logger = logging.getLogger(__name__)

def send_booking_email(booking, template_name, subject, extra_context=None):
    """
    Utility to send booking-related emails.
    """
    context = {
        'booking': booking,
        'client': booking.client,
        'chef': booking.chef,
        'site_name': 'Foodie',
    }
    if extra_context:
        context.update(extra_context)

    try:
        # For now, we'll just use a simple text email until HTML templates are designed
        # But we'll try to load the template if it exists
        try:
            html_message = render_to_string(f'emails/{template_name}.html', context)
            plain_message = strip_tags(html_message)
        except Exception:
            # Fallback to a very basic string if template loading fails
            plain_message = f"Booking Update: {subject}\nBooking ID: {booking.id}\nStatus: {booking.status}"
            html_message = None

        recipient_list = [booking.client.email]
        if booking.chef and booking.chef.user.email not in recipient_list:
            recipient_list.append(booking.chef.user.email)

        send_mail(
            subject=subject,
            message=plain_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=recipient_list,
            html_message=html_message,
            fail_silently=False,
        )
        logger.info(f"Sent booking email '{subject}' for booking {booking.id}")
        return True
    except Exception as e:
        logger.error(f"Failed to send booking email: {str(e)}")
        return False

def notify_booking_created(booking):
    return send_booking_email(
        booking, 
        'booking_created', 
        f"New Booking Request: #{booking.id}",
        {'message': 'Your booking request has been received and is pending chef approval.'}
    )

def notify_booking_confirmed(booking):
    return send_booking_email(
        booking, 
        'booking_confirmed', 
        f"Booking Confirmed: #{booking.id}",
        {'message': 'Great news! Your booking has been confirmed by the chef.'}
    )

def notify_booking_cancelled(booking, cancelled_by):
    return send_booking_email(
        booking, 
        'booking_cancelled', 
        f"Booking Cancelled: #{booking.id}",
        {'message': f'The booking has been cancelled by {cancelled_by}.'}
    )
