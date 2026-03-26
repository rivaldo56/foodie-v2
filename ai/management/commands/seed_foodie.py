from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from chefs.models import ChefProfile
from bookings.models import MenuItem
import random

User = get_user_model()

class Command(BaseCommand):
    help = 'Seeds the database with sample chefs and menu items'

    def handle(self, *args, **options):
        self.stdout.write("Starting database seeding...")
        
        # 1. Create or get chefs
        chef_data = [
            {
                'email': 'chef.marco@example.com',
                'full_name': 'Marco Rossi',
                'specialties': ['italian', 'pasta', 'mediterranean'],
                'bio': 'Award-winning Italian chef with 15 years of experience in Rome.',
                'rating': 4.9,
                'hourly_rate': 4500,
                'dishes': [
                    {'name': 'Truffle Mushroom Risotto', 'price': 1800, 'category': 'main_course'},
                    {'name': 'Handmade Tagliatelle Carbonara', 'price': 1500, 'category': 'main_course'},
                    {'name': 'Authentic Tiramisu', 'price': 800, 'category': 'dessert'},
                ]
            },
            {
                'email': 'chef.amina@example.com',
                'full_name': 'Amina Juma',
                'specialties': ['swahili', 'african', 'seafood'],
                'bio': 'Coastal cuisine specialist bringing the taste of Mombasa to your kitchen.',
                'rating': 4.8,
                'hourly_rate': 3500,
                'dishes': [
                    {'name': 'Swahili Fish Curry (Samaki wa Kupaka)', 'price': 1600, 'category': 'main_course'},
                    {'name': 'Beef Pilau with Kachumbari', 'price': 1200, 'category': 'main_course'},
                    {'name': 'Coconut Bean Soup', 'price': 600, 'category': 'appetizer'},
                ]
            },
            {
                'email': 'chef.leo@example.com',
                'full_name': 'Leo Chen',
                'specialties': ['asian', 'chinese', 'sushi'],
                'bio': 'Master of Asian fusion and modern sushi techniques.',
                'rating': 4.7,
                'hourly_rate': 5000,
                'dishes': [
                    {'name': 'Signature Dragon Roll', 'price': 2200, 'category': 'main_course'},
                    {'name': 'Wagyu Beef Stir-Fry', 'price': 2800, 'category': 'main_course'},
                    {'name': 'Matcha Green Tea Cheesecake', 'price': 900, 'category': 'dessert'},
                ]
            },
            {
                'email': 'chef.sarah@example.com',
                'full_name': 'Sarah Miller',
                'specialties': ['vegan', 'healthy', 'plant-based'],
                'bio': 'Nutritionist turned chef specializing in vibrant plant-based culinary art.',
                'rating': 4.6,
                'hourly_rate': 3000,
                'dishes': [
                    {'name': 'Quinoa Buddha Bowl', 'price': 1100, 'category': 'main_course'},
                    {'name': 'Jackfruit Tacos with Avocado Crema', 'price': 1300, 'category': 'main_course'},
                    {'name': 'Zucchini Noodle Pesto', 'price': 1000, 'category': 'main_course'},
                ]
            }
        ]

        for data in chef_data:
            first_name = data['full_name'].split(' ')[0]
            last_name = ' '.join(data['full_name'].split(' ')[1:])
            user, created = User.objects.get_or_create(
                email=data['email'],
                defaults={
                    'username': data['email'].split('@')[0],
                    'first_name': first_name,
                    'last_name': last_name,
                    'role': 'chef',
                    'is_active': True
                }
            )
            if created:
                user.set_password('foodie123')
                user.save()
            
            chef_profile, _ = ChefProfile.objects.get_or_create(
                user=user,
                defaults={
                    'bio': data['bio'],
                    'specialties': data['specialties'],
                    'average_rating': data['rating'],
                    'hourly_rate': data['hourly_rate'],
                    'is_available': True,
                    'years_of_experience': 10,
                    'city': 'Nairobi',
                    'state': 'Nairobi',
                    'is_verified': True
                }
            )
            
            for dish in data['dishes']:
                MenuItem.objects.get_or_create(
                    chef=chef_profile,
                    name=dish['name'],
                    defaults={
                        'price_per_serving': dish['price'],
                        'category': dish['category'],
                        'description': f"Delicious {dish['name']} prepared by {data['full_name']}.",
                        'preparation_time': random.randint(30, 90),
                        'is_available': True
                    }
                )

        self.stdout.write(self.style.SUCCESS(f"Successfully seeded {len(chef_data)} chefs and their dishes!"))
