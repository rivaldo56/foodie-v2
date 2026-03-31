from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("chefs", "0002_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="chefprofile",
            name="culinary_paths",
            field=models.JSONField(blank=True, default=list),
        ),
        migrations.AddField(
            model_name="chefprofile",
            name="document_uploads",
            field=models.JSONField(blank=True, default=list),
        ),
        migrations.AddField(
            model_name="chefprofile",
            name="identity_verification_status",
            field=models.CharField(
                choices=[
                    ("pending", "Pending"),
                    ("verified", "Verified"),
                    ("rejected", "Rejected"),
                ],
                default="pending",
                max_length=20,
            ),
        ),
    ]
