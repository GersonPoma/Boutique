from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from drf_spectacular.utils import extend_schema, OpenApiExample
from .serializers import TextInputSerializer
from apps.reportes.ventas.services import analizar_nlp
from apps.reportes.ventas.services_reporte import generar_reporte_ventas
from apps.reportes.productos.services import analizar_nlp_productos
from apps.reportes.productos.services_reporte import generar_reporte_productos
import requests


class NLPAnalyzeView(APIView):
    @extend_schema(
        summary="Analiza texto en lenguaje natural y genera reporte",
        description="Recibe texto en lenguaje natural (o voz convertida a texto), lo analiza y genera un reporte de ventas en el formato solicitado (Excel o PDF).",
        request=TextInputSerializer,
        responses={
            200: OpenApiExample(
                'Archivo de reporte generado',
                value="Archivo Excel o PDF",
                response_only=True
            ),
            400: {"error": "Parámetros inválidos o datos insuficientes"}
        },
        tags=["NLP"],
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

        # Validar que el texto no esté vacío
        if not text:
            return Response(
                {"error": "El campo 'text' no puede estar vacío"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            # Analizar el texto con NLP
            query = analizar_nlp(text)

            # Validar que se hayan detectado los datos mínimos necesarios
            if not query.get("rango"):
                return Response(
                    {"error": "No se pudo detectar un rango de fechas en el texto"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Generar el reporte
            result = generar_reporte_ventas(query)

            # FileResponse ya tiene el formato correcto, devolverlo directamente
            return result

        except requests.exceptions.RequestException as e:
            return Response(
                {"error": "Error al conectar con el servicio de negocio", "detalles": str(e)},
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


class NLPAnalyzeProductosView(APIView):
    @extend_schema(
        summary="Analiza texto en lenguaje natural y genera reporte de productos",
        description="Recibe texto en lenguaje natural para generar reportes de productos más vendidos, con filtros por marca, género, tipo de prenda, etc. Combina datos de Venta, DetalleVenta y Producto.",
        request=TextInputSerializer,
        responses={
            200: OpenApiExample(
                'Archivo de reporte generado',
                value="Archivo Excel o PDF",
                response_only=True
            ),
            400: {"error": "Parámetros inválidos o datos insuficientes"}
        },
        tags=["NLP"],
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

        # Validar que el texto no esté vacío
        if not text:
            return Response(
                {"error": "El campo 'text' no puede estar vacío"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            # Analizar el texto con NLP
            query = analizar_nlp_productos(text)

            # Validar que se hayan detectado los datos mínimos necesarios
            if not query.get("rango"):
                return Response(
                    {"error": "No se pudo detectar un rango de fechas en el texto"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Generar el reporte
            result = generar_reporte_productos(query)

            # FileResponse ya tiene el formato correcto, devolverlo directamente
            return result

        except requests.exceptions.RequestException as e:
            return Response(
                {"error": "Error al conectar con el servicio de negocio", "detalles": str(e)},
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

