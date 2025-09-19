from django.db import models
from django.conf import settings

# Create your models here.
class Profile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    graduation_year = models.IntegerField(null=True, blank=True)
    rating_avg = models.FloatField(default=0.0)     # reviews
    rating_count = models.IntegerField(default=0)

    def __str__(self):
        return f"{self.user.email} profile"