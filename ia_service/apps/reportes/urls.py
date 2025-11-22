from django.urls import path
from .views import ReporteView

urlpatterns = [
    path('generar/', ReporteView.as_view(), name='generar-reporte'),
]
