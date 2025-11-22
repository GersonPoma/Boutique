"""
Script para entrenar el modelo de predicción de ventas de productos
"""

import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

from apps.prediccion.model import ProductSalesPredictionModel
from apps.prediccion.data_service import (
    obtener_datos_historicos_entrenamiento,
    obtener_estadisticas_datos
)
import logging

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(levelname)s %(asctime)s %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)

logger = logging.getLogger(__name__)

URL_SERVICE_NEGOCIO = "http://localhost:8081/api"

def entrenar_modelo(fecha_desde=None, epochs=50):
    """
    Entrena el modelo con datos históricos del servicio de negocio

    Args:
        fecha_desde: Fecha inicial del histórico (default: 2023-01-01)
                    Si es None, usa desde 2023-01-01 hasta hoy
        epochs: Número de épocas de entrenamiento
    """
    print("\n" + "=" * 80)
    print("🚀 ENTRENAMIENTO DEL MODELO DE PREDICCIÓN DE VENTAS")
    print("=" * 80 + "\n")

    try:
        # 1. Obtener datos históricos del servicio de negocio
        logger.info("PASO 1/4: Obteniendo datos históricos...")
        df_historico = obtener_datos_historicos_entrenamiento(fecha_desde=fecha_desde)

        if len(df_historico) < 10:
            logger.error("❌ No hay suficientes datos para entrenar (mínimo: 10 productos)")
            logger.error("   Asegúrate de que el servicio de negocio tenga ventas históricas")
            return False

        # 2. Mostrar estadísticas
        logger.info("\nPASO 2/4: Analizando datos...")
        stats = obtener_estadisticas_datos(df_historico)

        # 3. Inicializar y entrenar el modelo
        logger.info("\nPASO 3/4: Entrenando modelo...")
        model = ProductSalesPredictionModel()

        history = model.train(
            df_historico,
            epochs=epochs,
            batch_size=32,
            validation_split=0.2
        )

        # 4. Guardar el modelo
        logger.info("\nPASO 4/4: Guardando modelo...")
        model_dir = os.path.join(os.path.dirname(__file__), '..', '..', 'ml_models')
        model.save(model_dir=model_dir)

        print("\n" + "=" * 80)
        print("✅ ENTRENAMIENTO COMPLETADO EXITOSAMENTE")
        print("=" * 80)
        print(f"\n📁 Modelo guardado en: {model_dir}")
        print(f"📊 Productos entrenados: {len(df_historico)}")
        print(f"📈 Épocas completadas: {len(history.history['loss'])}")
        print(f"📉 Loss final: {history.history['loss'][-1]:.4f}")
        print(f"📉 Validation loss final: {history.history['val_loss'][-1]:.4f}")
        print("\n🎯 El modelo está listo para hacer predicciones")
        print("   Usa 'python prediccion_service.py' para generar predicciones\n")

        return True

    except Exception as e:
        logger.error(f"\n❌ ERROR DURANTE EL ENTRENAMIENTO: {e}")
        import traceback
        traceback.print_exc()
        return False


if __name__ == "__main__":
    import argparse
    from datetime import datetime

    parser = argparse.ArgumentParser(description='Entrenar modelo de predicción de ventas')
    parser.add_argument('--desde', type=str, default='2023-01-01',
                       help='Fecha inicial del histórico (formato: YYYY-MM-DD, default: 2023-01-01)')
    parser.add_argument('--epochs', type=int, default=50,
                       help='Número de épocas de entrenamiento (default: 50)')

    args = parser.parse_args()

    # Parsear la fecha
    try:
        fecha_desde = datetime.strptime(args.desde, '%Y-%m-%d').date()
    except ValueError:
        logger.error(f"❌ Formato de fecha inválido: {args.desde}")
        logger.error("   Use formato YYYY-MM-DD (ejemplo: 2023-01-01)")
        sys.exit(1)

    hoy = datetime.now().date()
    meses_diff = (hoy.year - fecha_desde.year) * 12 + (hoy.month - fecha_desde.month)

    print("\n📋 CONFIGURACIÓN DEL ENTRENAMIENTO:")
    print(f"   Fecha desde: {fecha_desde}")
    print(f"   Fecha hasta: {hoy}")
    print(f"   Período: ~{meses_diff} meses (~{meses_diff/12:.1f} años)")
    print(f"   Épocas: {args.epochs}")
    print()

    # Verificar que el servicio de negocio esté disponible
    import requests
    try:
        response = requests.get("http://localhost:8081/api/reporte/productos",
                               params={'desde': '2024-01-01', 'hasta': '2024-01-01', 'limite': 1},
                               timeout=5)
        logger.info("✅ Servicio de negocio disponible")
    except:
        logger.error("❌ No se puede conectar al servicio de negocio (http://localhost:8081)")
        logger.error("   Asegúrate de que Boutique_back esté corriendo")
        sys.exit(1)

    # Entrenar
    success = entrenar_modelo(fecha_desde=fecha_desde, epochs=args.epochs)

    sys.exit(0 if success else 1)

