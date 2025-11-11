"""
Script de prueba para análisis NLP de reportes de productos
"""
from pprint import pprint
from apps.reportes.productos.services import analizar_nlp_productos

frases = [
    "dame un reporte de los productos más vendidos este mes",
    "quiero un reporte en excel de los 10 productos más vendidos de marca nike este mes",
    "dame un reporte en pdf de los productos de marca adidas más vendidos del mes pasado",
    "quiero ver los 5 productos más vendidos en ventas online este año",
    "dame un reporte de las zapatillas nike más vendidas este mes",
    "quiero un reporte de los productos para hombre de marca puma más vendidos",
    "dame los 20 productos más vendidos pagados a crédito este año",
    "quiero ver los productos más baratos vendidos este mes",
    "dame un reporte de las camisas más vendidas del mes pasado",
    "quiero ver los top 10 productos más vendidos en ventas físicas completadas este mes",
    # Nuevas pruebas con filtros adicionales
    "dame un reporte de las camisetas de algodón más vendidas este mes",
    "quiero ver los productos deportivos nike más vendidos",
    "dame las zapatillas talla 9 más vendidas de marca adidas",
    "quiero un reporte de la ropa de invierno más vendida del mes pasado",
    "dame los productos casuales de marca levis más vendidos este año",
    "quiero ver las zapatillas deportivas para uso diario más vendidas",
    "dame un reporte de los productos elegantes para mujer más vendidos",
    "quiero ver las camisas de algodón talla M más vendidas",
    "dame los productos de cuero más caros vendidos este mes",
    "quiero un reporte de la ropa de verano casual más vendida",
    "quiero ver los top 20 productos más vendidos en ventas físicas completadas este mes",
    "quiero los 30 productos más vendidos del año pasado",
]

print("=" * 80)
print("PRUEBA DE ANÁLISIS NLP - REPORTES DE PRODUCTOS")
print("=" * 80)

for i, frase in enumerate(frases, 1):
    print(f"\n{'=' * 80}")
    print(f"FRASE {i}: {frase}")
    print("=" * 80)
    resultado = analizar_nlp_productos(frase)
    pprint(resultado, width=80)
    print()

print("\n" + "=" * 80)
print("PRUEBA COMPLETADA")
print("=" * 80)

