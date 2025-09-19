from django.db import models
from django.conf import settings

# Create your models here.

class Item(models.Model):
    CATEGORY_CHOICES = [
        ("TEXTBOOK", "Textbook"),
        ("ELECTRONICS", "Electronics"),
        ("FURNITURE", "Furniture"),
        ("CLOTHING", "Clothing"),
        ("OTHER", "Other"),
    ]

    CONDITION_CHOICES = [
        ("NEW", "Like New"),
        ("GOOD", "Gently Used"),
        ("FAIR", "Fair"),
    ]

    seller = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE,
        related_name="items"
    )
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default="OTHER")
    condition = models.CharField(max_length=20, choices=CONDITION_CHOICES, default="GOOD")
    is_negotiable = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} (${self.price})"


class ItemImage(models.Model):
    item = models.ForeignKey(Item, on_delete=models.CASCADE, related_name="images")
    image = models.ImageField(upload_to="item_images/")

    def __str__(self):
        return f"Image for {self.item.title}"
