import os
import django

import sys
from pathlib import Path

# Add project root to sys.path
root_path = Path(__file__).resolve().parent.parent
sys.path.append(str(root_path))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'chefconnect.settings')
django.setup()

from django.contrib.auth import get_user_model
from chefs.models import ChefProfile
from bookings.models import ChefMenu, MenuItem
from experiences.models import Experience

User = get_user_model()

def seed_e2e():
    # 1. Create client
    client, created = User.objects.get_or_create(
        email='client@example.com',
        defaults={
            'username': 'client_e2e',
            'role': 'client',
            'is_active': True,
            'first_name': 'E2E',
            'last_name': 'Client'
        }
    )
    client.set_password('password123')
    client.save()
    print(f"{'[CREATED]' if created else '[UPDATED]'} Client: client@example.com")

    # 2. Create chef
    chef_user, created = User.objects.get_or_create(
        email='chef@example.com',
        defaults={
            'username': 'chef_e2e',
            'role': 'chef',
            'is_active': True,
            'first_name': 'E2E',
            'last_name': 'Chef'
        }
    )
    chef_user.set_password('password123')
    chef_user.save()
    
    chef_profile, _ = ChefProfile.objects.get_or_create(
        user=chef_user,
        defaults={
            'bio': 'I am a professional chef for E2E testing.',
            'years_of_experience': 10,
            'city': 'Nairobi',
            'is_verified': True
        }
    )
    print(f"{'[CREATED]' if created else '[UPDATED]'} Chef: chef@example.com")

    # 3. Create Experience and Menu
    experience, _ = Experience.objects.get_or_create(
        slug='private-dinner',
        defaults={
            'name': 'Private Dinner',
            'description': 'A fine dining experience at home.'
        }
    )

    menu, _ = ChefMenu.objects.get_or_create(
        chef=chef_profile, 
        experience=experience,
        title="E2E Signature Menu",
        defaults={
            'description': 'A world class signature experience.',
            'pricing_rules': {
                'guest_tiers': [{'min': 1, 'max': 10, 'price_per_person': 1500}],
                'labour_fee': 500
            }
        }
    )

    # 4. Create menu items
    MenuItem.objects.get_or_create(
        chef=chef_profile,
        name="Grilled Salmon",
        defaults={
            'price_per_serving': 1500, 
            'description': 'Fresh grilled salmon.',
            'category': 'main_course',
            'preparation_time': 30
        }
    )
    print("Database seeded for E2E tests.")

if __name__ == "__main__":
    seed_e2e()
