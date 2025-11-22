"""
Serializers para documentar las respuestas de la API de predicción
"""
from rest_framework import serializers


class PeriodoPrediccionSerializer(serializers.Serializer):
    """Periodo para el cual se hace la predicción"""
    inicio = serializers.DateField(help_text="Fecha inicial del periodo de predicción")
    fin = serializers.DateField(help_text="Fecha final del periodo de predicción")


class ResumenPrediccionSerializer(serializers.Serializer):
    """Resumen de la predicción generada"""
    mensaje = serializers.CharField(help_text="Mensaje descriptivo del periodo de predicción")
    periodoPrediccion = PeriodoPrediccionSerializer(help_text="Periodo para el cual se predice")
    totalUnidadesPredichas = serializers.IntegerField(help_text="Total de unidades predichas para el periodo")
    totalIngresoPredicho = serializers.FloatField(help_text="Ingreso total estimado en el periodo")
    totalProductosPredichos = serializers.IntegerField(help_text="Cantidad de productos en la predicción")


class ProductoPrediccionSerializer(serializers.Serializer):
    """Producto predicho con sus métricas"""
    ranking = serializers.IntegerField(help_text="Posición en el ranking de predicción")
    productoId = serializers.IntegerField(help_text="ID único del producto")
    productoNombre = serializers.CharField(help_text="Nombre del producto")
    marca = serializers.CharField(help_text="Marca del producto")
    genero = serializers.CharField(required=False, help_text="Género del producto")
    tipoPrenda = serializers.CharField(required=False, help_text="Tipo de prenda")
    temporada = serializers.CharField(required=False, help_text="Temporada del producto")
    precio = serializers.FloatField(help_text="Precio unitario del producto")
    cantidadPredicha = serializers.IntegerField(help_text="Cantidad de unidades predichas a vender")
    confianza = serializers.FloatField(help_text="Nivel de confianza de la predicción (0-100)")
    ventasHistoricas = serializers.IntegerField(help_text="Ventas históricas del producto")


class PrediccionResponseSerializer(serializers.Serializer):
    """Respuesta completa de la predicción"""
    resumen = ResumenPrediccionSerializer(help_text="Resumen general de la predicción")
    resultados = ProductoPrediccionSerializer(many=True, help_text="Lista de productos predichos")


class ErrorResponseSerializer(serializers.Serializer):
    """Respuesta de error estándar"""
    error = serializers.CharField(help_text="Mensaje de error")
    detalles = serializers.CharField(required=False, help_text="Detalles adicionales del error")

