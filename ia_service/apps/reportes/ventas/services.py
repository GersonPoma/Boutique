import re
import spacy
from datetime import datetime, timedelta
from dateutil.relativedelta import relativedelta

nlp = spacy.load("es_core_news_md")

# ======================
# 🔧 FUNCIONES AUXILIARES
# ======================

def detectar_formato(text):
    if "pdf" in text:
        return "pdf"
    elif "excel" in text or "xlsx" in text:
        return "excel"
    return "excel"

def detectar_moneda(text):
    if "bs" in text or "boliviano" in text:
        return "bs"
    elif "dólar" in text or "usd" in text:
        return "usd"
    elif "euro" in text:
        return "eur"
    return None

def detectar_rango_tiempo(text):
    hoy = datetime.now().date()

    if "año pasado" in text:
        return datetime(hoy.year - 1, 1, 1).date(), datetime(hoy.year - 1, 12, 31).date()
    elif "este año" in text:
        return datetime(hoy.year, 1, 1).date(), hoy
    elif "este mes" in text or "mes actual" in text:
        inicio = hoy.replace(day=1)
        fin = hoy
        return inicio, fin
    elif "mes pasado" in text:
        inicio = (hoy - relativedelta(months=1)).replace(day=1)
        fin = inicio + relativedelta(months=1, days=-1)
        return inicio, fin
    elif "hace" in text:
        # Capturar frases tipo "hace 5 meses" o "hace 1 año" (singular y plural)
        m_mes = re.search(r"hace\s+(\d+)\s+mes(?:es)?", text)
        m_anio = re.search(r"hace\s+(?:un|una|\d+)\s+año(?:s)?", text)

        if m_mes:
            meses = int(m_mes.group(1))
            inicio = hoy - relativedelta(months=meses)
            return inicio, hoy
        elif m_anio:
            # Capturar "un" o "una" como 1
            cantidad = m_anio.group(0)
            if "un " in cantidad or "una " in cantidad:
                años = 1
            else:
                años = int(re.search(r"\d+", cantidad).group())
            inicio = hoy - relativedelta(years=años)
            return inicio, hoy

    # Por defecto: mes actual (desde el día 1 hasta hoy)
    inicio = hoy.replace(day=1)
    return inicio, hoy

def detectar_condiciones_enums(text):
    condiciones = {}

    # 🔹 Tipo de pago
    if "crédito" in text or "credito" in text:
        condiciones["tipoPago"] = "CREDITO"
    elif "contado" in text:
        condiciones["tipoPago"] = "CONTADO"

    # 🔹 Tipo de venta
    if "física" in text or "fisica" in text:
        condiciones["tipoVenta"] = "FISICA"
    elif "online" in text or "virtual" in text or "web" in text:
        condiciones["tipoVenta"] = "ONLINE"

    # 🔹 Estado
    if "pendiente" in text:
        condiciones["estado"] = "PENDIENTE"
    elif "completad" in text or "finalizad" in text:
        condiciones["estado"] = "COMPLETADA"
    elif "cancelad" in text:
        condiciones["estado"] = "CANCELADA"
    elif "proceso" in text:
        condiciones["estado"] = "EN_PROCESO"
    elif "pagando" in text or "se estén pagando" in text or "pagándose" in text:
        condiciones["estado"] = "PAGANDO_CREDITO"

    return condiciones

def detectar_condicion_monto(text):
    condicion = {}

    # Detectar negaciones: "no sean mayor" = "menor", "no superen" = "menor"
    if re.search(r"no\s+(?:sean?\s+)?(?:superen|mayor(?:es)?|pasen)", text):
        condicion["operador"] = "menor"
    elif re.search(r"no\s+(?:sean?\s+)?(?:menor(?:es)?|bajen)", text):
        condicion["operador"] = "mayor"
    # Detectar operadores positivos
    elif re.search(r"superen|mayor(?:es)?\s+(?:a|de)|más\s+de", text):
        condicion["operador"] = "mayor"
    elif re.search(r"no\s+pasen|menor(?:es)?\s+(?:a|de)|menos\s+de", text):
        condicion["operador"] = "menor"

    # Buscar números cerca de palabras clave de comparación o moneda
    # Evitamos números en expresiones de tiempo como "hace 3 meses"
    match = re.search(r'(?:superen|mayor(?:es)?\s+(?:a|de)|más\s+de|no\s+(?:sean?\s+)?(?:superen|mayor(?:es)?|pasen)|no\s+pasen|menor(?:es)?\s+(?:a|de)|menos\s+de)\s+(?:de\s+)?(\d+(?:[.,]\d+)?)\s*(?:bs|bolivianos?|usd|dólares?|euros?)?', text)

    if not match:
        # Buscar números seguidos directamente de moneda
        match = re.search(r'(\d+(?:[.,]\d+)?)\s*(?:bs|bolivianos?|usd|dólares?|euros?)', text)

    if match:
        valor_str = match.group(1).replace(",", ".")
        condicion["valor"] = float(valor_str)

    moneda = detectar_moneda(text)
    if moneda:
        condicion["moneda"] = moneda

    return condicion if condicion else None

# ======================
# FUNCIÓN PRINCIPAL
# ======================

def analizar_nlp(text):
    text = text.lower()
    doc = nlp(text)

    formato = detectar_formato(text)
    rango = detectar_rango_tiempo(text)
    condiciones_enum = detectar_condiciones_enums(text)
    condicion_monto = detectar_condicion_monto(text)

    result = {
        "entidad": "ventas",
        "formato": formato,
        "rango": {
            "inicio": str(rango[0]),
            "fin": str(rango[1])
        },
        "condiciones": condiciones_enum
    }

    if condicion_monto:
        result["condicionMonto"] = condicion_monto

    return result
