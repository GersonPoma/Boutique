# from requests import Response
from datetime import datetime, date
from dateutil.relativedelta import relativedelta
from drf_spectacular.utils import extend_schema, OpenApiParameter
from drf_spectacular.types import OpenApiTypes
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.prediccion.prediccion_service import validar_modelo_disponible, generar_prediccion
from apps.prediccion.serializers import (
    PrediccionResponseSerializer,
    ErrorResponseSerializer
)


def _parse_date_param(val, default):
    """Parsea un parámetro de fecha en formato YYYY-MM-DD"""
    if not val:
        return default
    try:
        return datetime.strptime(val, "%Y-%m-%d").date()
    except ValueError:
        return None


class PrediccionApiView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]
    @extend_schema(
        summary="Generar predicción de productos más vendidos para un periodo futuro",
        description=(
            "Genera una predicción de los productos más vendidos para un periodo futuro específico "
            "usando un **enfoque híbrido inteligente** que combina:\n\n"
            "1. **Datos estacionales (70%)**: Mismos meses de años anteriores desde 2023 "
            "(captura patrones estacionales específicos)\n"
            "2. **Datos recientes (30%)**: Últimos 3 meses "
            "(captura tendencias actuales y productos nuevos)\n\n"
            "### 📅 Ejemplos de uso:\n"
            "- **Predecir para diciembre**: `fecha_inicio=2025-12-01&fecha_fin=2025-12-31`\n"
            "- **Predecir para verano completo**: `fecha_inicio=2025-12-01&fecha_fin=2026-02-28`\n"
            "- **Predecir próximo mes**: No especificar fechas (usa default)\n"
            "- **Predecir Nike para enero**: `fecha_inicio=2026-01-01&fecha_fin=2026-01-31&marca=NIKE`\n\n"
            "### 🌡️ Temporadas (Bolivia - Hemisferio Sur):\n"
            "- **VERANO**: Diciembre, Enero, Febrero\n"
            "- **OTOÑO**: Marzo, Abril, Mayo\n"
            "- **INVIERNO**: Junio, Julio, Agosto\n"
            "- **PRIMAVERA**: Septiembre, Octubre, Noviembre\n\n"
            "Se pueden aplicar filtros opcionales como marca, género o tipo de prenda."
        ),
        parameters=[
            OpenApiParameter(
                name="fecha_inicio",
                type=OpenApiTypes.DATE,
                location=OpenApiParameter.QUERY,
                description=(
                    "Fecha inicial del periodo FUTURO a predecir (formato: YYYY-MM-DD). "
                    "Por defecto: primer día del próximo mes. "
                    "Ejemplo: 2025-12-01"
                ),
                required=False
            ),
            OpenApiParameter(
                name="fecha_fin",
                type=OpenApiTypes.DATE,
                location=OpenApiParameter.QUERY,
                description=(
                    "Fecha final del periodo FUTURO a predecir (formato: YYYY-MM-DD). "
                    "Por defecto: último día del próximo mes. "
                    "Ejemplo: 2025-12-31"
                ),
                required=False
            ),
            OpenApiParameter(
                name="top_n",
                type=OpenApiTypes.INT,
                location=OpenApiParameter.QUERY,
                description="Número de productos top a retornar (por defecto: 10)",
                required=False,
                default=10
            ),
            OpenApiParameter(
                name="marca",
                type=OpenApiTypes.STR,
                location=OpenApiParameter.QUERY,
                description="Filtrar por marca específica",
                required=False,
                enum=["NIKE", "ADIDAS", "PUMA", "CONVERSE", "NEW_BALANCE", "REEBOK",
                      "LEVIS", "CAT", "LEE", "SKECHERS", "CREP_PROTECT", "DKNY",
                      "UNDER_ARMOUR", "EVERLAST"]
            ),
            OpenApiParameter(
                name="genero",
                type=OpenApiTypes.STR,
                location=OpenApiParameter.QUERY,
                description="Filtrar por género",
                required=False,
                enum=["HOMBRE", "MUJER", "UNISEX", "NINO", "NINA"]
            ),
            OpenApiParameter(
                name="tipoPrenda",
                type=OpenApiTypes.STR,
                location=OpenApiParameter.QUERY,
                description="Filtrar por tipo de prenda",
                required=False,
                enum=["CAMISETA", "CAMISA", "BLUSA", "SUDADERA", "SUETER", "PANTALON",
                      "FALDA", "SHORT", "LEGGIN", "JEANS", "VESTIDO", "CHAQUETA",
                      "ABRIGO", "ZAPATOS", "BOTAS", "SANDALIAS", "ZAPATILLAS"]
            ),
        ],
        responses={
            200: PrediccionResponseSerializer,
            400: ErrorResponseSerializer,
            500: ErrorResponseSerializer,
            503: ErrorResponseSerializer
        },
        tags=["Predicción"]
    )
    def get(self, request):
        if not validar_modelo_disponible():
            return Response(
                {"error": "El modelo de predicción no está disponible. Por favor, entrena el modelo primero."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )

        try:
            # Parsear top_n
            top_n = request.query_params.get('top_n', 10)
            try:
                top_n = int(top_n)
            except ValueError:
                top_n = 10

            # Parsear fechas FUTURAS para las que se quiere predecir
            start_raw = request.query_params.get('fecha_inicio')
            end_raw = request.query_params.get('fecha_fin')

            # Por defecto: predecir para el próximo mes
            hoy = date.today()
            proximo_mes = hoy + relativedelta(months=1)
            inicio_proximo_mes = proximo_mes.replace(day=1)
            fin_proximo_mes = (inicio_proximo_mes + relativedelta(months=1, days=-1))

            fecha_inicio_prediccion = _parse_date_param(start_raw, inicio_proximo_mes)
            fecha_fin_prediccion = _parse_date_param(end_raw, fin_proximo_mes)

            # Validar fechas
            if fecha_inicio_prediccion is None or fecha_fin_prediccion is None:
                return Response(
                    {"error": "Formato de fecha inválido. Use YYYY-MM-DD (ejemplo: 2025-12-01)"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            if fecha_inicio_prediccion > fecha_fin_prediccion:
                return Response(
                    {"error": "La fecha inicial no puede ser posterior a la fecha final"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Validar que las fechas sean futuras (al menos desde hoy)
            if fecha_fin_prediccion < hoy:
                return Response(
                    {"error": f"Las fechas deben ser futuras. Hoy es {hoy}"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Parsear filtros
            filtros = {}
            if 'marca' in request.query_params:
                filtros['marca'] = request.query_params.get('marca')
            if 'genero' in request.query_params:
                filtros['genero'] = request.query_params.get('genero')
            if 'tipoPrenda' in request.query_params:
                filtros['tipoPrenda'] = request.query_params.get('tipoPrenda')

            # Generar predicción para el periodo futuro
            resultados = generar_prediccion(
                filtros=filtros,
                top_n=top_n,
                fecha_inicio_prediccion=fecha_inicio_prediccion,
                fecha_fin_prediccion=fecha_fin_prediccion
            )

            total_unidades_predichas = sum(item['cantidadPredicha'] for item in resultados)
            total_dinero_predicho = sum(
                item['cantidadPredicha'] * item['precio'] for item in resultados
            )

            response_data = {
                "resumen": {
                    "mensaje": f"Predicción de ventas desde {fecha_inicio_prediccion} hasta {fecha_fin_prediccion}",
                    "periodoPrediccion": {
                        "inicio": str(fecha_inicio_prediccion),
                        "fin": str(fecha_fin_prediccion)
                    },
                    "totalUnidadesPredichas": total_unidades_predichas,
                    "totalIngresoPredicho": round(total_dinero_predicho, 2),
                    "totalProductosPredichos": len(resultados),
                },
                "resultados": resultados
            }

            return Response(response_data, status=status.HTTP_200_OK)
        except FileNotFoundError as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        except ValueError as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {"error": "Error interno al generar la predicción", "detalles": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )