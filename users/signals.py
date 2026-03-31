from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import User, ClientProfile


@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    """
    Signal to create the appropriate profile when a User is created.
    """
    if created:
        if instance.role == User.Role.CLIENT:
            ClientProfile.objects.create(user=instance)

        elif instance.role == User.Role.CHEF:
            # Avoid circular import by importing inside the function
            from chefs.models import ChefProfile

            ChefProfile.objects.create(user=instance)

        elif instance.role in [User.Role.FARMER, User.Role.BUSINESS]:
            from farmers.models import FarmerProfile

            FarmerProfile.objects.create(
                user=instance,
                farm_name=(
                    f"{instance.first_name}'s Farm"
                    if instance.role == User.Role.FARMER
                    else f"{instance.first_name}'s Business"
                ),
                location="Nairobi",  # Default location
                bio="",
            )


@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    """
    Signal to save the profile when the User is saved.
    """
    if instance.role == User.Role.CLIENT and hasattr(instance, "client_profile"):
        instance.client_profile.save()
    elif instance.role == User.Role.CHEF and hasattr(instance, "chef_profile"):
        instance.chef_profile.save()
    elif instance.role in [User.Role.FARMER, User.Role.BUSINESS] and hasattr(
        instance, "farmer_profile"
    ):
        instance.farmer_profile.save()
