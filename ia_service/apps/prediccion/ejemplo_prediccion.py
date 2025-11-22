"""
Ejemplos de uso del API de Predicción de Ventas
Ejecutar después de entrenar el modelo
"""

import requests
from datetime import date, timedelta
from dateutil.relativedelta import relativedelta

# URL base del servicio
BASE_URL = "http://localhost:8000/api/prediccion/"


def ejemplo_1_predecir_diciembre():
    """Predecir productos más vendidos en diciembre 2025"""
    print("\n" + "="*70)
    print("EJEMPLO 1: Predecir para diciembre 2025")
    print("="*70)

    params = {
        'fecha_inicio': '2025-12-01',
        'fecha_fin': '2025-12-31',
        'top_n': 10
    }

    response = requests.get(BASE_URL, params=params)
    if response.status_code == 200:
        data = response.json()
        print(f"\n✅ {data['resumen']['mensaje']}")
        print(f"Total unidades predichas: {data['resumen']['totalUnidadesPredichas']}")
        print(f"Ingreso estimado: ${data['resumen']['totalIngresoPredicho']:.2f}")
        print(f"\nTop 5 productos:")
        for producto in data['resultados'][:5]:
            print(f"  {producto['ranking']}. {producto['productoNombre']} - {producto['cantidadPredicha']} unidades")
    else:
        print(f"❌ Error: {response.json()}")


def ejemplo_2_predecir_verano():
    """Predecir productos para la temporada de verano completa"""
    print("\n" + "="*70)
    print("EJEMPLO 2: Predecir para el verano (dic-ene-feb)")
    print("="*70)

    params = {
        'fecha_inicio': '2025-12-01',
        'fecha_fin': '2026-02-28',
        'top_n': 15
    }

    response = requests.get(BASE_URL, params=params)
    if response.status_code == 200:
        data = response.json()
        print(f"\n✅ {data['resumen']['mensaje']}")
        print(f"Total unidades predichas: {data['resumen']['totalUnidadesPredichas']}")
        print(f"Ingreso estimado: ${data['resumen']['totalIngresoPredicho']:.2f}")
    else:
        print(f"❌ Error: {response.json()}")


def ejemplo_3_predecir_nike_enero():
    """Predecir productos NIKE para enero"""
    print("\n" + "="*70)
    print("EJEMPLO 3: Productos NIKE para enero 2026")
    print("="*70)

    params = {
        'fecha_inicio': '2026-01-01',
        'fecha_fin': '2026-01-31',
        'marca': 'NIKE',
        'top_n': 10
    }

    response = requests.get(BASE_URL, params=params)
    if response.status_code == 200:
        data = response.json()
        print(f"\n✅ {data['resumen']['mensaje']}")
        print(f"Total productos NIKE predichos: {data['resumen']['totalProductosPredichos']}")
        print(f"\nTop productos NIKE:")
        for producto in data['resultados'][:5]:
            print(f"  {producto['ranking']}. {producto['productoNombre']} - "
                  f"{producto['cantidadPredicha']} unidades (confianza: {producto['confianza']:.1f}%)")
    else:
        print(f"❌ Error: {response.json()}")


def ejemplo_4_predecir_proximo_mes():
    """Predecir sin especificar fechas (usa default: próximo mes)"""
    print("\n" + "="*70)
    print("EJEMPLO 4: Predecir para el próximo mes (default)")
    print("="*70)

    params = {
        'top_n': 10
    }

    response = requests.get(BASE_URL, params=params)
    if response.status_code == 200:
        data = response.json()
        print(f"\n✅ {data['resumen']['mensaje']}")
        print(f"Periodo: {data['resumen']['periodoPrediccion']['inicio']} a "
              f"{data['resumen']['periodoPrediccion']['fin']}")
        print(f"Total unidades predichas: {data['resumen']['totalUnidadesPredichas']}")
    else:
        print(f"❌ Error: {response.json()}")


def ejemplo_5_predecir_ropa_deportiva_invierno():
    """Predecir ropa deportiva para el invierno"""
    print("\n" + "="*70)
    print("EJEMPLO 5: Ropa deportiva para el invierno 2026")
    print("="*70)

    params = {
        'fecha_inicio': '2026-06-01',
        'fecha_fin': '2026-08-31',
        'tipoPrenda': 'SUDADERA',
        'top_n': 10
    }

    response = requests.get(BASE_URL, params=params)
    if response.status_code == 200:
        data = response.json()
        print(f"\n✅ {data['resumen']['mensaje']}")
        print(f"Total sudaderas predichas: {data['resumen']['totalProductosPredichos']}")
        for producto in data['resultados'][:5]:
            print(f"  {producto['ranking']}. {producto['productoNombre']} - "
                  f"${producto['precio']} - {producto['cantidadPredicha']} unidades")
    else:
        print(f"❌ Error: {response.json()}")


def ejemplo_6_predecir_mujer_primavera():
    """Predecir ropa de mujer para primavera"""
    print("\n" + "="*70)
    print("EJEMPLO 6: Ropa de mujer para primavera 2026")
    print("="*70)

    params = {
        'fecha_inicio': '2026-09-01',
        'fecha_fin': '2026-11-30',
        'genero': 'MUJER',
        'top_n': 10
    }

    response = requests.get(BASE_URL, params=params)
    if response.status_code == 200:
        data = response.json()
        print(f"\n✅ {data['resumen']['mensaje']}")
        print(f"Total productos para mujer: {data['resumen']['totalProductosPredichos']}")
        print(f"Ingreso estimado: ${data['resumen']['totalIngresoPredicho']:.2f}")
    else:
        print(f"❌ Error: {response.json()}")


def ejemplo_error_fecha_pasada():
    """Intentar predecir para una fecha pasada (debe fallar)"""
    print("\n" + "="*70)
    print("EJEMPLO ERROR: Intentar predecir para fecha pasada")
    print("="*70)

    params = {
        'fecha_inicio': '2024-01-01',
        'fecha_fin': '2024-01-31',
        'top_n': 10
    }

    response = requests.get(BASE_URL, params=params)
    if response.status_code == 400:
        print(f"\n❌ Error esperado: {response.json()['error']}")
    else:
        print(f"⚠️ Debería haber dado error 400")


def ejemplo_prediccion_trimestral():
    """Predecir para el próximo trimestre"""
    print("\n" + "="*70)
    print("EJEMPLO 7: Predicción trimestral (Q1 2026)")
    print("="*70)

    params = {
        'fecha_inicio': '2026-01-01',
        'fecha_fin': '2026-03-31',
        'top_n': 20
    }

    response = requests.get(BASE_URL, params=params)
    if response.status_code == 200:
        data = response.json()
        print(f"\n✅ {data['resumen']['mensaje']}")
        print(f"Total unidades predichas para el trimestre: {data['resumen']['totalUnidadesPredichas']}")
        print(f"Ingreso estimado: ${data['resumen']['totalIngresoPredicho']:.2f}")
        print(f"Total productos en top 20: {data['resumen']['totalProductosPredichos']}")
    else:
        print(f"❌ Error: {response.json()}")


if __name__ == "__main__":
    print("\n")
    print("🤖 EJEMPLOS DE USO - API DE PREDICCIÓN DE VENTAS")
    print("="*70)
    print("Asegúrate de:")
    print("  1. Tener el servidor corriendo (python manage.py runserver)")
    print("  2. Haber entrenado el modelo (python apps/prediccion/train_model.py)")
    print("="*70)

    try:
        # Ejecutar todos los ejemplos
        ejemplo_1_predecir_diciembre()
        ejemplo_2_predecir_verano()
        ejemplo_3_predecir_nike_enero()
        ejemplo_4_predecir_proximo_mes()
        ejemplo_5_predecir_ropa_deportiva_invierno()
        ejemplo_6_predecir_mujer_primavera()
        ejemplo_prediccion_trimestral()

        # Ejemplo de error
        ejemplo_error_fecha_pasada()

        print("\n" + "="*70)
        print("✅ Todos los ejemplos ejecutados")
        print("="*70 + "\n")

    except requests.exceptions.ConnectionError:
        print("\n❌ Error: No se pudo conectar al servidor.")
        print("   Asegúrate de que el servidor esté corriendo:")
        print("   python manage.py runserver")
    except Exception as e:
        print(f"\n❌ Error inesperado: {e}")

