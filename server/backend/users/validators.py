from django.core.exceptions import ValidationError

def edu_email_validator(email):
    if not email.lower().endswith(".edu"):
        raise ValidationError("Please use your .edu email address.")
