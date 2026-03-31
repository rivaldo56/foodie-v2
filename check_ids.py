from users.models import User
from chefs.models import ChefProfile
from django.db import models
import uuid

def get_id_type(model):
    field = model._meta.get_field('id')
    return field.get_internal_type()

print(f"User ID type: {get_id_type(User)}")
print(f"ChefProfile ID type: {get_id_type(ChefProfile)}")

user = User.objects.first()
if user:
    print(f"Sample User ID: {user.id} (Type: {type(user.id)})")
else:
    print("No users found")

chef = ChefProfile.objects.first()
if chef:
    print(f"Sample Chef ID: {chef.id} (Type: {type(chef.id)})")
else:
    print("No chefs found")
