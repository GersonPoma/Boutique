from requests import RequestException
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from drf_spectacular.utils import extend_schema, OpenApiExample

from .nlp_router import detectar_intencion
from .serializers import TextInputSerializer
from apps.reportes.ventas.services import analizar_nlp
from apps.reportes.ventas.services_reporte import generar_reporte_ventas
from apps.reportes.productos.services import analizar_nlp_productos
from apps.reportes.productos.services_reporte import generar_reporte_productos
import requests


class ReporteView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    @extend_schema(
        summary="Generador inteligente de reportes",
        description="Detecta automáticamente si la consulta es sobre ventas o productos y genera el archivo "
                    "correspondiente.",
        request=TextInputSerializer,
        responses={
            200: OpenApiExample(
                'Archivo generado',
                value="Archivo binario (Excel o PDF)",
                response_only=True
            ),
            400: {"error": "Error de validación o parámetros faltantes"}
        },
        tags=["NLP Reports"],
    )
    def post(self, request):
        # Validar el serializer
        serializer = TextInputSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {"error": "Datos inválidos", "detalles": serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )

        text = serializer.validated_data.get("text", "").strip()

        try:
            intencion = detectar_intencion(text)

            if intencion == "ventas":
                return self._procesar_reporte_ventas(text)
            else:
                return self._procesar_reporte_productos(text)

        except RequestException as e:
            return Response(
                {"error": "Error al conectar con el servicio de negocio", "\nDetalles": str(e)},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )
        except ValueError as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {"error": "Error interno al procesar la solicitud", "detalles": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def _procesar_reporte_ventas(self, text):
        query = analizar_nlp(text)

        if not query.get("rango"):
            return Response(
                {"error": "No se pudo detectar un rango de fechas en el texto"},
                status=status.HTTP_400_BAD_REQUEST
            )

        result = generar_reporte_ventas(query)
        return result

    def _procesar_reporte_productos(self, text):
        query = analizar_nlp_productos(text)

        if not query.get("rango"):
            return Response(
                {"error": "No se pudo detectar un rango de fechas en el texto"},
                status=status.HTTP_400_BAD_REQUEST
            )

        result = generar_reporte_productos(query)
        return result