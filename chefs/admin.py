from django.contrib import admin
from django.utils.html import format_html
from .models import (
    ChefProfile,
    ChefCertification,
    ChefReview,
    FavoriteChef,
    ChefOnboarding,
)


@admin.register(ChefProfile)
class ChefProfileAdmin(admin.ModelAdmin):
    list_display = [
        "user",
        "city",
        "state",
        "experience_level",
        "hourly_rate",
        "identity_verification_status",
        "is_verified",
        "is_available",
    ]
    list_filter = [
        "is_verified",
        "is_available",
        "experience_level",
        "identity_verification_status",
    ]
    search_fields = ["user__full_name", "user__email", "city", "state"]
    readonly_fields = [
        "created_at",
        "updated_at",
        "average_rating",
        "total_reviews",
        "total_bookings",
    ]
    actions = ["sync_from_onboarding"]

    fieldsets = (
        ("User Information", {"fields": ("user",)}),
        (
            "Profile Details",
            {
                "fields": (
                    "bio",
                    "display_specialties",
                    "culinary_paths",
                    "experience_level",
                    "years_of_experience",
                    "display_hourly_rate",
                )
            },
        ),
        (
            "Location & Availability",
            {
                "fields": (
                    "address",
                    "city",
                    "state",
                    "zip_code",
                    "service_radius",
                    "latitude",
                    "longitude",
                    "display_availability_schedule",
                )
            },
        ),
        (
            "Verification & Status",
            {
                "fields": (
                    "is_verified",
                    "identity_verification_status",
                    "background_check_completed",
                    "is_available",
                )
            },
        ),
        (
            "Documents & Portfolio",
            {
                "fields": ("portfolio_images", "certifications", "document_uploads"),
                "classes": ("collapse",),
            },
        ),
        (
            "Ratings & Statistics",
            {"fields": ("average_rating", "total_reviews", "total_bookings")},
        ),
        (
            "Timestamps",
            {"fields": ("created_at", "updated_at"), "classes": ("collapse",)},
        ),
    )
    readonly_fields = [
        "display_availability_schedule",
        "display_specialties",
        "display_hourly_rate",
        "created_at",
        "updated_at",
        "average_rating",
        "total_reviews",
        "total_bookings",
    ]

    @admin.action(description="Sync onboarding data → ChefProfile")
    def sync_from_onboarding(self, request, queryset):
        import json as _json

        synced = 0
        for profile in queryset:
            try:
                onboarding = profile.user.chef_onboarding
            except Exception:
                continue
            profile.specialties = onboarding.specialties
            profile.culinary_paths = onboarding.culinary_paths
            profile.portfolio_images = onboarding.portfolio_media
            profile.document_uploads = onboarding.certifications
            profile.certifications = onboarding.certifications
            profile.identity_verification_status = (
                onboarding.identity_verification_status
            )
            profile.availability_schedule = {
                slot: True for slot in (onboarding.availability_options or [])
            }
            valid_levels = [c[0] for c in ChefProfile.ExperienceLevel.choices]
            if onboarding.experience_level in valid_levels:
                profile.experience_level = onboarding.experience_level

            # Pricing tier mapping
            if onboarding.pricing_tier == "Budget":
                profile.hourly_rate = 20.00
            elif onboarding.pricing_tier == "Fair Market":
                profile.hourly_rate = 45.00
            elif onboarding.pricing_tier == "Premium":
                profile.hourly_rate = 100.00

            for slot in onboarding.availability_options or []:
                try:
                    avail = _json.loads(slot)
                    if isinstance(avail, dict):
                        if avail.get("city"):
                            profile.city = avail["city"]
                        if avail.get("state"):
                            profile.state = avail["state"]
                        if avail.get("travelDistance"):
                            profile.service_radius = int(avail["travelDistance"])
                        if avail.get("lat"):
                            profile.latitude = avail["lat"]
                        if avail.get("lng"):
                            profile.longitude = avail["lng"]
                        break
                except (ValueError, TypeError):
                    continue
            profile.save()
            synced += 1
        self.message_user(
            request, f"Synced {synced} chef profile(s) from onboarding data."
        )

    @admin.display(description="Schedule")
    def display_availability_schedule(self, obj):
        if not obj.availability_schedule:
            return "Not set"
        items = []
        for k, v in obj.availability_schedule.items():
            if k.startswith("{"):
                try:
                    import json as _json

                    d = _json.loads(k)
                    items.append(f"<b>Type:</b> {d.get('availabilityType')}")
                    items.append(f"<b>Slots:</b> {', '.join(d.get('timeSlots', []))}")
                    if d.get("casualDays"):
                        items.append(
                            f"<b>Days:</b> {', '.join(d.get('casualDays', []))}"
                        )
                except Exception:
                    items.append(k)
            else:
                items.append(k)
        return format_html("<br>".join(items))

    @admin.display(description="Specialties")
    def display_specialties(self, obj):
        if not obj.specialties:
            return "-"
        badges = [
            format_html(
                '<span style="background:#ffb703; color:#000; padding:2px 6px; border-radius:4px; margin-right:4px;">{}</span>',
                s,
            )
            for s in obj.specialties
        ]
        return format_html(" ".join(badges))

    @admin.display(description="Hourly Rate")
    def display_hourly_rate(self, obj):
        return format_html(
            '<span style="font-weight:bold; color:#4ade80;">${:,.2f}</span>',
            obj.hourly_rate,
        )


@admin.register(ChefOnboarding)
class ChefOnboardingAdmin(admin.ModelAdmin):
    list_display = [
        "user",
        "pricing_tier",
        "experience_level",
        "completed",
        "updated_at",
    ]
    list_filter = ["completed", "pricing_tier", "experience_level"]
    search_fields = ["user__email", "user__full_name"]
    readonly_fields = ["updated_at"]

    fieldsets = (
        ("User", {"fields": ("user", "completed")}),
        (
            "Professional",
            {
                "fields": (
                    "culinary_paths",
                    "specialties",
                    "experience_level",
                    "pricing_tier",
                )
            },
        ),
        (
            "Media & Docs",
            {
                "fields": (
                    "portfolio_media",
                    "certifications",
                    "identity_verification_status",
                )
            },
        ),
        ("Availability", {"fields": ("availability_options",)}),
    )


@admin.register(ChefCertification)
class ChefCertificationAdmin(admin.ModelAdmin):
    list_display = [
        "chef",
        "name",
        "issuing_organization",
        "issue_date",
        "expiry_date",
        "is_verified",
    ]
    list_filter = ["is_verified", "issuing_organization"]
    search_fields = ["chef__user__full_name", "name", "issuing_organization"]
    date_hierarchy = "issue_date"


@admin.register(ChefReview)
class ChefReviewAdmin(admin.ModelAdmin):
    list_display = [
        "chef",
        "client",
        "rating",
        "food_quality",
        "professionalism",
        "punctuality",
        "created_at",
    ]
    list_filter = ["rating", "created_at"]
    search_fields = ["chef__user__full_name", "client__full_name", "comment"]
    readonly_fields = ["created_at", "updated_at"]
    date_hierarchy = "created_at"


@admin.register(FavoriteChef)
class FavoriteChefAdmin(admin.ModelAdmin):
    list_display = ["user", "chef", "created_at"]
    list_filter = ["created_at"]
    search_fields = ["user__full_name", "chef__user__full_name"]
    date_hierarchy = "created_at"
