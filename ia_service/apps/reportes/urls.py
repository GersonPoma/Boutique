from django.urls import path
from .views import NLPAnalyzeView, NLPAnalyzeProductosView

urlpatterns = [
    path('analyze/', NLPAnalyzeView.as_view(), name='nlp-analyze'),
    path('productos/analyze/', NLPAnalyzeProductosView.as_view(), name='nlp-analyze-productos'),
]
