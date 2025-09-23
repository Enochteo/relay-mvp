from rest_framework.routers import DefaultRouter
from .views import ItemViewSet
from django.urls import path, include

router = DefaultRouter()
router.register(r'items', ItemViewSet, basename='item')

urlpatterns = [
    # ... other urls
    path("api/", include(router.urls)),
]