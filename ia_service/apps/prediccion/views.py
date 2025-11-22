# from requests import Response
from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.prediccion.prediccion_service import validar_modelo_disponible, generar_prediccion


class PrediccionApiView(APIView):
    # @extend_schema(
    #     summary="Generar predicción de productos más vendidos",
    #     description="Genera una predicción de los productos más vendidos para el próximo mes. "
    #                 "Se pueden aplicar filtros opcionales como marca, género o tipo de prenda.",
    #     parameters=[
    #         {
    #             "name": "top_n",
    #             "description": "Número de productos top a retornar (por defecto 10)",
    #             "required": False,
    #             "type": "integer",
    #         },
    #         {
    #             "name": "marca",
    #             "description": "Filtrar por marca específica",
    #             "required": False,
    #             "type": "string",
    #         },
    #         {
    #             "name": "genero",
    #             "description": "Filtrar por género (Hombre, Mujer, Unisex, Niño, Niña)",
    #             "required": False,
    #             "type": "string",
    #         },
    #         {
    #             "name": "tipoPrenda",
    #             "description": "Filtrar por tipo de prenda (Camiseta, Pantalón, etc.)",
    #             "required": False,
    #             "type": "string",
    #         },
    #     ],
    #     responses={
    #         200: {
    #             "description": "Predicción generada exitosamente",
    #             "content": {
    #                 "application/json": {
    #                     "example": {
    #                         "resumen": {
    #                             "mensaje": "Predicción para el próximo mes",
    #                             "totalUnidadesPredichas": 1500,
    #                             "totalIngresoPredicho": 45000.75,
    #                             "totalProductosPredichos": 10
    #                         },
    #                         "resultados": [
    #                             {
    #                                 "ranking": 1,
    #                                 "productoId": 101,
    #                                 "productoNombre": "Camiseta Deportiva Nike",
    #                                 "marca": "NIKE",
    #                                 "genero": "Hombre",
    #                                 "tipoPrenda": "Camiseta",
    #                                 "precio": 29.99,
    #                                 "cantidadPredicha": 300,
    #                                 "confianza": 95.5
    #                             },
    #                             # ... más productos ...
    #                         ]
    #                     }
    #                 }
    #             }
    #         },
    #         503: {
    #             "description": "El modelo de predicción no está disponible"
    #         },
    #         500: {
    #             "description": "Error interno al generar la predicción"
    #         }
    #     }
    # )
    def get(self, request):
        if not validar_modelo_disponible():
            return Response(
                {"error": "El modelo de predicción no está disponible. Por favor, entrena el modelo primero."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )

        try:
            top_n = request.query_params.get('top_n', 10)
            try:
                top_n = int(top_n)
            except ValueError:
                top_n = 10

            filtros = {}
            if 'marca' in request.query_params:
                filtros['marca'] = request.query_params('marca')
            if 'genero' in request.query_params:
                filtros['genero'] = request.query_params('genero')
            if 'tipoPrenda' in request.query_params:
                filtros['tipoPrenda'] = request.query_params('tipoPrenda')

            resultados = generar_prediccion(filtros=filtros, top_n=top_n)

            total_unidades_predichas = sum(item['cantidadPredicha'] for item in resultados)
            total_dinero_predicho = sum(
                item['cantidadPredicha'] * item['precio'] for item in resultados
            )

            response_data = {
                "resumen": {
                    "mensaje": "Predicción para el próximo mes",
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
        except Exception as e:
            return Response(
                {"error": "Error interno al generar la predicción", "detalles": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )