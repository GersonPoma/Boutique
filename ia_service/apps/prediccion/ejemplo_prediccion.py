"""
Script de ejemplo para generar predicciones con el modelo entrenado
"""

import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

from apps.prediccion.prediccion_service import generar_prediccion, validar_modelo_disponible
import logging

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(levelname)s %(message)s'
)

logger = logging.getLogger(__name__)


def main():
    print("\n" + "=" * 80)
    print("🔮 PREDICCIÓN DE PRODUCTOS MÁS VENDIDOS")
    print("=" * 80 + "\n")

    # Verificar que el modelo esté entrenado
    if not validar_modelo_disponible():
        print("❌ Error: El modelo no ha sido entrenado")
        print("\n📋 Para entrenar el modelo, ejecuta:")
        print("   python apps/prediccion/train_model.py\n")
        return

    try:
        # Ejemplo 1: Top 20 productos en general
        print("📊 EJEMPLO 1: Top 20 productos predichos (sin filtros)")
        print("-" * 80)
        resultados = generar_prediccion(top_n=20)

        if resultados:
            print("\n🏆 RESULTADOS:")
            print(f"{'#':<4} {'Producto':<40} {'Predicción':<12} {'Confianza':<10}")
            print("-" * 80)
            for prod in resultados:
                print(
                    f"{prod['ranking']:<4} "
                    f"{prod['productoNombre'][:39]:<40} "
                    f"{prod['cantidadPredicha']:>10} uds "
                    f"{prod['confianza']:>8.1f}%"
                )
        else:
            print("⚠️  No se generaron predicciones")

        # Ejemplo 2: Top 10 productos Nike
        print("\n\n📊 EJEMPLO 2: Top 10 productos Nike predichos")
        print("-" * 80)
        resultados_nike = generar_prediccion(
            filtros={'marca': 'NIKE'},
            top_n=10
        )

        if resultados_nike:
            print("\n🏆 RESULTADOS NIKE:")
            print(f"{'#':<4} {'Producto':<40} {'Predicción':<12} {'Confianza':<10}")
            print("-" * 80)
            for prod in resultados_nike:
                print(
                    f"{prod['ranking']:<4} "
                    f"{prod['productoNombre'][:39]:<40} "
                    f"{prod['cantidadPredicha']:>10} uds "
                    f"{prod['confianza']:>8.1f}%"
                )
        else:
            print("⚠️  No se generaron predicciones para Nike")

        # Resumen
        print("\n" + "=" * 80)
        print("✅ PREDICCIÓN COMPLETADA")
        print("=" * 80)
        print("\n💡 NOTA: Las predicciones se basan en el historial de ventas")
        print("   y las características de cada producto.\n")

    except Exception as e:
        logger.error(f"\n❌ Error al generar predicción: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    main()

