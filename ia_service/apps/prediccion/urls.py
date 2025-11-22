from django.urls import path

from apps.prediccion.views import PrediccionApiView

urlpatterns = [
    path('prediccion/', PrediccionApiView.as_view(), name='prediccion-api'),
]