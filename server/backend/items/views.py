from rest_framework import viewsets, permissions
from .models import Item
from .serializers import ItemSerializer
from rest_framework.response import Response
from rest_framework.decorators import action

# Create your views here.
class ItemViewSet(viewsets.ModelViewSet):
    queryset = Item.objects.all().order_by("-created_at")
    serializer_class = ItemSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(seller=self.request.user)
    
    @action(detail=False, methods=["get"], permission_classes=[permissions.IsAuthenticated])
    def my_items(self, request):
        items = Item.objects.filter(seller=request.user).order_by("-created_at")
        serializer = self.get_serializer(items, many=True)
        return Response(serializer.data)