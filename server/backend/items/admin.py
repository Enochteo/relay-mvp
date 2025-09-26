from django.contrib import admin
from .models import Item, ItemImage
# Register your models here.

class ItemImageInline(admin.TabularInline):
    model = ItemImage
    extra = 1

@admin.register(Item)
class ItemAdmin(admin.ModelAdmin):
    list_display = ("title", "price", "category", "condition", "is_negotiable", "created_at", "seller")
    list_filter = ("category", "condition", "is_negotiable", "created_at")
    search_fields = ("title", "description", "seller__email")
    inlines = [ItemImageInline]

@admin.register(ItemImage)
class ItemImageAdmin(admin.ModelAdmin):
    list_display = ("item", "image")