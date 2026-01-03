from celery import shared_task
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.conf import settings
from .models import User, CommunicationLog
import logging

logger = logging.getLogger(__name__)

@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def send_post_onboarding_email(self, user_id):
    """
    Sends a welcome email to the user after they complete onboarding.
    Idempotent: Checks CommunicationLog before sending.
    Retries: Up to 3 times on failure.
    Uses HTML templates with text fallback.
    """
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        logger.error(f"User with id {user_id} not found.")
        return

    comm_type = 'onboarding_welcome'

    # Idempotency Check
    if CommunicationLog.objects.filter(user=user, communication_type=comm_type, status=CommunicationLog.Status.SENT).exists():
        logger.info(f"Onboarding email already sent to user {user.email}. Skipping.")
        return

    # Create Log Entry (Pending)
    log, created = CommunicationLog.objects.get_or_create(
        user=user,
        communication_type=comm_type,
        defaults={'status': CommunicationLog.Status.PENDING}
    )

    # Double check race condition if not created
    if not created and log.status == CommunicationLog.Status.SENT:
        return

    subject = ""
    template_name = ""
    cta_link = ""
    
    # Base URL for deep links
    fe_url = getattr(settings, 'FE_URL', "http://localhost:3000")

    # Content Logic
    if user.role == User.Role.CLIENT:
        subject = "Welcome to Foodie - Your Journey Begins"
        template_name = "users/emails/welcome_client.html"
        cta_link = f"{fe_url}/orders/start"
    elif user.role == User.Role.CHEF:
        subject = "Welcome to Foodie - Let's Get Cooking"
        template_name = "users/emails/welcome_chef.html"
        cta_link = f"{fe_url}/chef/menu/create"
    else:
        logger.warning(f"Onboarding email skipped for role: {user.role}")
        log.status = CommunicationLog.Status.FAILED
        log.error_message = f"Unsupported role: {user.role}"
        log.save()
        return

    context = {
        'first_name': user.first_name,
        'last_name': user.last_name,
        'user': user,
        'cta_link': cta_link,
    }

    try:
        # Render HTML content
        html_content = render_to_string(template_name, context)
        # Create text content via stripping tags (basic fallback) or just a simple message
        # For simplicity/speed here, assuming basic fallback text
        text_content = f"Welcome to Foodie! Please visit {cta_link} to get started."

        # Send Email
        msg = EmailMultiAlternatives(
            subject=subject,
            body=text_content,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[user.email]
        )
        msg.attach_alternative(html_content, "text/html")
        msg.send()

        # Update Log - Success
        log.status = CommunicationLog.Status.SENT
        log.save()
        logger.info(f"Onboarding email sent successfully to {user.email}")

    except Exception as e:
        logger.error(f"Failed to send onboarding email to {user.email}: {str(e)}")
        log.status = CommunicationLog.Status.FAILED
        log.error_message = str(e)
        log.save()
        
        # Retry logic
        raise self.retry(exc=e)
