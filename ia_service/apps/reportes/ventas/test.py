from pprint import pprint

from apps.reportes.ventas.services import analizar_nlp

frases = [
    "quiero un reporte en excel de las ventas a crédito de este mes que aún se estén pagando",
    "dame un reporte en pdf de las ventas físicas completadas del mes pasado",
    "quiero un reporte en excel de las ventas online que superen los 500 bs hace 5 meses",
    "dame un reporte en pdf de las ventas a contado menores a 1000 dólares del año pasado",
    "quiero un reporte de las ventas a crédito completadas este año que superen los 2000 bolivianos",
    "dame un reporte de las ventas online pendientes de hace 3 meses que no pasen de 1500 bs",
    "dame un reporte en excel de las ventas fisicas completadas pagados a credito del mes pasado",
]

for f in frases:
    print(f"\n{f}")
    pprint(analizar_nlp(f))
