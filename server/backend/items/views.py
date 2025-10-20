from rest_framework import viewsets, permissions, filters
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.parsers import MultiPartParser, FormParser
from django.db.models import Q, F
from django.conf import settings
from .models import Item
from .serializers import ItemSerializer

# Check if we're using PostgreSQL for full-text search features
try:
    from django.contrib.postgres.search import SearchVector, SearchQuery, SearchRank
    HAS_POSTGRES_SEARCH = 'postgresql' in settings.DATABASES['default']['ENGINE']
except ImportError:
    HAS_POSTGRES_SEARCH = False

class IsSellerOrReadOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.seller == request.user
    
class ItemViewSet(viewsets.ModelViewSet):
    parser_classes = [MultiPartParser, FormParser]
    serializer_class = ItemSerializer
    permission_classes = [IsSellerOrReadOnly]
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['created_at', 'price', 'title']
    ordering = ['-created_at']

    def get_queryset(self):
        if self.action == "my_items":
            return Item.objects.filter(seller=self.request.user)
        
        queryset = Item.objects.select_related('seller').prefetch_related('images')
        
        # Search functionality
        search = self.request.query_params.get('search', None)
        category = self.request.query_params.get('category', None)
        condition = self.request.query_params.get('condition', None)
        min_price = self.request.query_params.get('min_price', None)
        max_price = self.request.query_params.get('max_price', None)
        seller = self.request.query_params.get('seller', None)
        
        if search:
            if HAS_POSTGRES_SEARCH:
                # PostgreSQL full-text search
                search_vector = SearchVector('title', weight='A') + SearchVector('description', weight='B')
                search_query = SearchQuery(search)
                queryset = queryset.annotate(
                    search=search_vector,
                    rank=SearchRank(search_vector, search_query)
                ).filter(search=search_query).order_by('-rank', '-created_at')
            else:
                # SQLite compatible search using icontains
                queryset = queryset.filter(
                    Q(title__icontains=search) | 
                    Q(description__icontains=search)
                ).order_by('-created_at')
        
        # Filters
        if category:
            queryset = queryset.filter(category=category)
        
        if condition:
            queryset = queryset.filter(condition=condition)
            
        if min_price:
            queryset = queryset.filter(price__gte=min_price)
            
        if max_price:
            queryset = queryset.filter(price__lte=max_price)
            
        if seller:
            queryset = queryset.filter(
                Q(seller__full_name__icontains=seller) |
                Q(seller__email__icontains=seller)
            )
        
        return queryset

    def perform_create(self, serializer):
        serializer.save(seller=self.request.user)#, context={"request": self.request})

    def perform_update(self, serializer):
        serializer.save()#context={"request": self.request})
    
    @action(detail=False, methods=["get"], permission_classes=[permissions.IsAuthenticated])
    def my_items(self, request):
        items = Item.objects.filter(seller=request.user).order_by("-created_at")
        serializer = self.get_serializer(items, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=["get"])
    def search_suggestions(self, request):
        """Get search suggestions based on partial input"""
        query = request.query_params.get('q', '')
        if len(query) < 2:
            return Response([])
            
        suggestions = []
        
        # Title suggestions
        titles = Item.objects.filter(
            title__icontains=query
        ).values_list('title', flat=True).distinct()[:5]
        
        # Category suggestions
        categories = [choice[1] for choice in Item.CATEGORY_CHOICES 
                     if query.lower() in choice[1].lower()]
        
        suggestions.extend(list(titles))
        suggestions.extend(categories)
        
        return Response(suggestions[:8])
    
    @action(detail=False, methods=["get"])
    def trending(self, request):
        """Get trending/popular items"""
        # Simple trending based on recent items
        # Can be enhanced with view counts, message counts, etc.
        trending_items = Item.objects.order_by('-created_at')[:10]
        serializer = self.get_serializer(trending_items, many=True)
        return Response(serializer.data)
    