"""
Servicio para generar predicciones de productos más vendidos
Usa el modelo entrenado para predecir qué productos se venderán más
"""

import os
import logging
from apps.prediccion.model import ProductSalesPredictionModel
from apps.prediccion.data_service import obtener_datos_para_prediccion

logger = logging.getLogger(__name__)


def generar_prediccion(filtros=None, top_n=20, fecha_inicio_prediccion=None, fecha_fin_prediccion=None):
    """
    Genera predicción de productos más vendidos para un período futuro

    Args:
        filtros: Diccionario con filtros opcionales (marca, genero, etc.)
        top_n: Número de productos top a retornar
        fecha_inicio_prediccion: Fecha inicial del periodo FUTURO a predecir
        fecha_fin_prediccion: Fecha final del periodo FUTURO a predecir

    Returns:
        Lista de diccionarios con predicciones
    """
    logger.info("=" * 70)
    logger.info("GENERANDO PREDICCIÓN DE PRODUCTOS MÁS VENDIDOS")
    logger.info("=" * 70)

    if fecha_inicio_prediccion and fecha_fin_prediccion:
        logger.info(f"📅 Periodo de predicción: {fecha_inicio_prediccion} → {fecha_fin_prediccion}")

    try:
        # 1. Cargar el modelo entrenado
        logger.info("Cargando modelo entrenado...")
        model_dir = os.path.join(os.path.dirname(__file__), '..', '..', 'ml_models')

        if not os.path.exists(os.path.join(model_dir, 'product_sales_model.h5')):
            raise FileNotFoundError(
                "No se encontró el modelo entrenado. "
                "Ejecuta 'python apps/prediccion/train_model.py' primero"
            )

        model = ProductSalesPredictionModel()
        model.load(model_dir=model_dir)

        # 2. Obtener datos actuales de productos con información de la temporada futura
        logger.info("Obteniendo datos de productos...")
        df_productos = obtener_datos_para_prediccion(
            filtros=filtros,
            fecha_inicio_prediccion=fecha_inicio_prediccion,
            fecha_fin_prediccion=fecha_fin_prediccion
        )

        if len(df_productos) == 0:
            logger.warning("No se encontraron productos con los filtros especificados")
            return []

        # 3. Generar predicciones
        logger.info("Generando predicciones con el modelo...")
        df_predicciones = model.predict(df_productos)

        # 4. Ordenar por cantidad predicha (descendente)
        df_predicciones = df_predicciones.sort_values('cantidadPredicha', ascending=False)

        # 5. Tomar top N
        df_top = df_predicciones.head(top_n)

        # 6. Convertir a formato de respuesta
        resultados = []
        for idx, row in df_top.iterrows():
            resultado = {
                'productoId': int(row['productoId']),
                'productoNombre': row['productoNombre'],
                'marca': row.get('marca', 'N/A'),
                'precio': float(row['precio']),
                'cantidadPredicha': int(row['cantidadPredicha']),
                'confianza': float(row['confianza']),
                'ventasHistoricas': int(row.get('cantidadVendida', 0)),
                'ranking': idx + 1
            }

            # Agregar campos opcionales si existen
            if 'genero' in row:
                resultado['genero'] = row['genero']
            if 'tipoPrenda' in row:
                resultado['tipoPrenda'] = row['tipoPrenda']
            if 'temporada' in row:
                resultado['temporada'] = row['temporada']

            resultados.append(resultado)

        logger.info("=" * 70)
        logger.info(f"PREDICCIÓN COMPLETADA: {len(resultados)} productos")
        logger.info("=" * 70)

        # Log top 5 para referencia
        if resultados:
            logger.info("\nTOP 5 PRODUCTOS PREDICHOS:")
            for i, prod in enumerate(resultados[:5], 1):
                logger.info(
                    f"   {i}. {prod['productoNombre']} - "
                    f"Predicción: {prod['cantidadPredicha']} unidades "
                    f"(Confianza: {prod['confianza']}%)"
                )

        return resultados

    except FileNotFoundError as e:
        logger.error(str(e))
        raise
    except Exception as e:
        logger.error(f"Error al generar predicción: {e}")
        import traceback
        traceback.print_exc()
        raise


def validar_modelo_disponible():
    """
    Verifica si el modelo está entrenado y disponible

    Returns:
        bool: True si el modelo está disponible
    """
    model_dir = os.path.join(os.path.dirname(__file__), '..', '..', 'ml_models')
    model_path = os.path.join(model_dir, 'product_sales_model.h5')
    return os.path.exists(model_path)

