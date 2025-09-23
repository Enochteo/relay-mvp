from rest_framework import viewsets, permissions
from .models import Item
from .serializers import ItemSerializer
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.parsers import MultiPartParser, FormParser

# Create your views here.
class IsSellerOrReadOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.seller == request.user
    
class ItemViewSet(viewsets.ModelViewSet):
    parser_classes = [MultiPartParser, FormParser]
    
    serializer_class = ItemSerializer
    permission_classes = [IsSellerOrReadOnly]
    def get_queryset(self):
        if self.action == "my_items":
            return Item.objects.filter(seller=self.request.user)
        return Item.objects.all()

    def perform_create(self, serializer):
        serializer.save(seller=self.request.user)
    
    @action(detail=False, methods=["get"], permission_classes=[permissions.IsAuthenticated])
    def my_items(self, request):
        items = Item.objects.filter(seller=request.user).order_by("-created_at")
        serializer = self.get_serializer(items, many=True)
        return Response(serializer.data)
    