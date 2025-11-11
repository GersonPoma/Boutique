from django.urls import path
from .views import NLPAnalyzeView, NLPAnalyzeProductosView

urlpatterns = [
    path('ventas/', NLPAnalyzeView.as_view(), name='nlp-analyze-ventas'),
    path('productos/', NLPAnalyzeProductosView.as_view(), name='nlp-analyze-productos'),
]
