"""
Servicio de análisis NLP para reportes de productos
"""
import re
import spacy
from datetime import datetime
from dateutil.relativedelta import relativedelta

nlp = spacy.load("es_core_news_md")

# ======================
# 🔧 FUNCIONES AUXILIARES
# ======================

def detectar_formato(text):
    """Detecta el formato del reporte (excel/pdf)"""
    if "pdf" in text:
        return "pdf"
    elif "excel" in text or "xlsx" in text:
        return "excel"
    return "excel"


def detectar_rango_tiempo(text):
    """Detecta el rango de fechas desde el texto"""
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
        # Capturar frases tipo "hace 5 meses" o "hace 1 año"
        m_mes = re.search(r"hace\s+(\d+)\s+mes", text)
        m_anio = re.search(r"hace\s+(\d+)\s+año", text)
        if m_mes:
            meses = int(m_mes.group(1))
            inicio = hoy - relativedelta(months=meses)
            return inicio, hoy
        elif m_anio:
            años = int(m_anio.group(1))
            inicio = hoy - relativedelta(years=años)
            return inicio, hoy

    # Por defecto: mes actual (desde el día 1 hasta hoy)
    inicio = hoy.replace(day=1)
    return inicio, hoy


def detectar_marca(text):
    """Detecta la marca mencionada en el texto"""
    text_lower = text.lower()

    # Mapeo de nombres comunes a valores enum
    mapeo_marcas = {
        "nike": "NIKE",
        "new balance": "NEW_BALANCE",
        "cat": "CAT",
        "lee": "LEE",
        "skechers": "SKECHERS",
        "converse": "CONVERSE",
        "adidas": "ADIDAS",
        "puma": "PUMA",
        "crep protect": "CREP_PROTECT",
        "dkny": "DKNY",
        "under armour": "UNDER_ARMOUR",
        "reebok": "REEBOK",
        "levis": "LEVIS",
        "levi's": "LEVIS",
        "everlast": "EVERLAST"
    }

    for nombre, enum_val in mapeo_marcas.items():
        if nombre in text_lower:
            return enum_val

    return None


def detectar_genero(text):
    """Detecta el género del producto"""
    if "hombre" in text or "masculino" in text or "varones" in text or "caballero" in text:
        return "HOMBRE"
    elif "mujer" in text or "femenino" in text or "dama" in text:
        return "MUJER"
    elif "niño" in text and "niña" not in text:
        return "NINO"
    elif "niña" in text:
        return "NINA"
    elif "unisex" in text or "ambos" in text:
        return "UNISEX"
    return None


def detectar_tipo_prenda(text):
    """Detecta el tipo de prenda mencionada"""
    tipos_prenda = {
        "camiseta": "CAMISETA",
        "remera": "CAMISETA",
        "polo": "CAMISETA",
        "camisa": "CAMISA",
        "blusa": "BLUSA",
        "sudadera": "SUDADERA",
        "sueter": "SUETER",
        "suéter": "SUETER",
        "jersey": "SUETER",
        "pantalon": "PANTALON",
        "pantalón": "PANTALON",
        "falda": "FALDA",
        "short": "SHORT",
        "leggin": "LEGGIN",
        "legging": "LEGGIN",
        "jeans": "JEANS",
        "jean": "JEANS",
        "vaquero": "JEANS",
        "vestido": "VESTIDO",
        "chaqueta": "CHAQUETA",
        "casaca": "CHAQUETA",
        "abrigo": "ABRIGO",
        "sujetador": "SUJETADOR",
        "sosten": "SUJETADOR",
        "bra": "SUJETADOR",
        "boxer": "BOXER",
        "calzoncillo": "CALZONCILLO",
        "tanga": "TANGA",
        "lenceria": "LENCERIA",
        "lencería": "LENCERIA",
        "bufanda": "BUFANDA",
        "sombrero": "SOMBRERO",
        "gorra": "SOMBRERO",
        "guantes": "GUANTES",
        "bolso": "BOLSO",
        "cartera": "BOLSO",
        "zapatos": "ZAPATOS",
        "zapato": "ZAPATOS",
        "botas": "BOTAS",
        "bota": "BOTAS",
        "sandalias": "SANDALIAS",
        "sandalia": "SANDALIAS",
        "zapatillas": "ZAPATILLAS",
        "zapatilla": "ZAPATILLAS",
        "tenis": "ZAPATILLAS",
        "deportivas": "ZAPATILLAS",
        "bikini": "BIKINI",
        "bañador": "BANADOR",
        "banador": "BANADOR",
        "traje de baño": "BANADOR"
    }

    text_lower = text.lower()
    for palabra, enum_val in tipos_prenda.items():
        if palabra in text_lower:
            return enum_val

    return None


def detectar_talla(text):
    """Detecta la talla mencionada en el texto"""
    text_lower = text.lower()

    # Primero buscar tallas de calzado (números)
    if re.search(r"(?:talla|numero|número)\s*(?:de\s*)?(\d+(?:\.\d+)?)", text_lower):
        match = re.search(r"(?:talla|numero|número)\s*(?:de\s*)?(\d+(?:\.\d+)?)", text_lower)
        numero = match.group(1)

        mapeo_numeros = {
            "6": "NUM_6",
            "7": "NUM_7",
            "7.5": "NUM_7_5",
            "8": "NUM_8",
            "8.5": "NUM_8_5",
            "9": "NUM_9",
            "9.5": "NUM_9_5",
            "10": "NUM_10",
            "11": "NUM_11"
        }

        if numero in mapeo_numeros:
            return mapeo_numeros[numero]

    # Buscar tallas de ropa (letras) con contexto
    tallas_contexto = {
        r"\btalla\s+xs\b": "XS",
        r"\btalla\s+s\b": "S",
        r"\btalla\s+m\b": "M",
        r"\btalla\s+l\b": "L",
        r"\btalla\s+xl\b": "XL",
        r"\btalla\s+xxl\b": "XXL",
        r"\btalla\s+xxxl\b": "XXXL",
        r"\btalla\s+única": "TALLA_UNICA",
        r"\btalla\s+unica\b": "TALLA_UNICA",
        r"\bextra\s+small\b": "XS",
        r"\bsmall\b": "S",
        r"\bmedium\b": "M",
        r"\bmediano\b": "M",
        r"\blarge\b": "L",
        r"\bextra\s+large\b": "XL"
    }

    for patron, enum_val in tallas_contexto.items():
        if re.search(patron, text_lower):
            return enum_val

    return None


def detectar_temporada(text):
    """Detecta la temporada mencionada en el texto"""
    if "primavera" in text:
        return "PRIMAVERA"
    elif "verano" in text:
        return "VERANO"
    elif "otoño" in text or "otono" in text:
        return "OTONO"
    elif "invierno" in text:
        return "INVIERNO"
    return None


def detectar_estilo(text):
    """Detecta el estilo del producto"""
    estilos = {
        "casual": "CASUAL",
        "formal": "FORMAL",
        "deportivo": "DEPORTIVO",
        "elegante": "ELEGANTE",
        "vintage": "VINTAGE",
        "bohemio": "BOHEMIO",
        "rockero": "ROCKERO",
        "rock": "ROCKERO",
        "urbano": "URBANO",
        "preppy": "PREPPY",
        "minimalista": "MINIMALISTA",
        "nocturno": "NOCTURNO",
        "noche": "NOCTURNO",
        "fiesta": "NOCTURNO"
    }

    text_lower = text.lower()
    for palabra, enum_val in estilos.items():
        if palabra in text_lower:
            return enum_val

    return None


def detectar_material(text):
    """Detecta el material del producto"""
    materiales = {
        "algodon": "ALGODON",
        "algodón": "ALGODON",
        "lino": "LINO",
        "lana": "LANA",
        "seda": "SEDA",
        "cuero": "CUERO",
        "piel": "CUERO",
        "denim": "DENIM",
        "mezclilla": "DENIM",
        "poliester": "POLIESTER",
        "poliéster": "POLIESTER",
        "nylon": "NYLON",
        "viscosa": "VISCOSA",
        "lycra": "LYCRA",
        "rayon": "RAYON",
        "rayón": "RAYON",
        "cachemira": "CACHEMIRA",
        "terciopelo": "TERCIOPELO",
        "acrilico": "ACRILICO",
        "acrílico": "ACRILICO"
    }

    text_lower = text.lower()
    for palabra, enum_val in materiales.items():
        if palabra in text_lower:
            return enum_val

    return None


def detectar_uso(text):
    """Detecta el uso del producto"""
    if "diario" in text or "dia a dia" in text or "día a día" in text:
        return "DIARIO"
    elif "ocasional" in text:
        return "OCASIONAL"
    elif "deportivo" in text or "deporte" in text or "gym" in text or "gimnasio" in text:
        return "DEPORTIVO"
    elif "formal" in text or "trabajo" in text or "oficina" in text:
        return "FORMAL"
    elif "fiesta" in text or "celebracion" in text or "celebración" in text or "evento" in text:
        return "FIESTA"
    return None


def detectar_ordenamiento(text):
    """Detecta cómo ordenar los resultados"""
    if "más vendido" in text or "mas vendido" in text or "mejor" in text or "top" in text:
        return {"campo": "cantidadVendida", "orden": "DESC"}
    elif "menos vendido" in text or "peor" in text:
        return {"campo": "cantidadVendida", "orden": "ASC"}
    elif "más caro" in text or "mas caro" in text or "mayor precio" in text:
        return {"campo": "precio", "orden": "DESC"}
    elif "más barato" in text or "mas barato" in text or "menor precio" in text:
        return {"campo": "precio", "orden": "ASC"}

    # Por defecto, los más vendidos
    return {"campo": "cantidadVendida", "orden": "DESC"}


def detectar_limite(text):
    """Detecta el límite de resultados (top N)"""
    # Buscar patrones como "top 5", "top 10"
    match_top = re.search(r"top\s+(\d+)", text)
    if match_top:
        return int(match_top.group(1))

    # Buscar "los/las X productos/prendas/artículos"
    # Ejemplos: "dame los 20 productos", "quiero las 15 prendas"
    match_articulo = re.search(r"(?:dame|quiero|ver)\s+(?:los|las)\s+(\d+)\s+(?:productos?|prendas?|artículos?|items?)", text)
    if match_articulo:
        return int(match_articulo.group(1))

    # Buscar "los/las X más vendidos/vendidas"
    match_los_mas = re.search(r"(?:los|las)\s+(\d+)\s+(?:más|mas)\s+vendid[oa]s?", text)
    if match_los_mas:
        return int(match_los_mas.group(1))

    # Buscar "primeros X"
    match_primeros = re.search(r"primeros?\s+(\d+)", text)
    if match_primeros:
        return int(match_primeros.group(1))

    # Por defecto, top 10
    return 10


def detectar_condiciones_venta(text):
    """Detecta condiciones relacionadas con las ventas (tipo de venta, tipo de pago, etc.)"""
    condiciones = {}

    # Tipo de pago
    if "crédito" in text or "credito" in text:
        condiciones["tipoPago"] = "CREDITO"
    elif "contado" in text:
        condiciones["tipoPago"] = "CONTADO"

    # Tipo de venta
    if "física" in text or "fisica" in text:
        condiciones["tipoVenta"] = "FISICA"
    elif "online" in text or "virtual" in text or "web" in text:
        condiciones["tipoVenta"] = "ONLINE"

    # Estado de venta
    if "pendiente" in text:
        condiciones["estadoVenta"] = "PENDIENTE"
    elif "completad" in text or "finalizad" in text:
        condiciones["estadoVenta"] = "COMPLETADA"
    elif "cancelad" in text:
        condiciones["estadoVenta"] = "CANCELADA"

    return condiciones if condiciones else None


# ======================
# 🧠 FUNCIÓN PRINCIPAL
# ======================

def analizar_nlp_productos(text):
    """
    Analiza texto en lenguaje natural para generar reportes de productos

    Retorna:
    {
        'entidad': 'productos',
        'formato': 'excel',
        'rango': {'inicio': '2025-11-01', 'fin': '2025-11-11'},
        'filtros': {
            'marca': 'NIKE',
            'genero': 'HOMBRE',
            'tipoPrenda': 'ZAPATILLAS',
            'talla': 'M',
            'temporada': 'VERANO',
            'estilo': 'DEPORTIVO',
            'material': 'ALGODON',
            'uso': 'DIARIO'
        },
        'condicionesVenta': {
            'tipoVenta': 'ONLINE',
            'tipoPago': 'CREDITO'
        },
        'ordenamiento': {'campo': 'cantidadVendida', 'orden': 'DESC'},
        'limite': 10
    }
    """
    text = text.lower()
    doc = nlp(text)

    formato = detectar_formato(text)
    rango = detectar_rango_tiempo(text)

    # Filtros de producto
    filtros = {}

    marca = detectar_marca(text)
    if marca:
        filtros["marca"] = marca

    genero = detectar_genero(text)
    if genero:
        filtros["genero"] = genero

    tipo_prenda = detectar_tipo_prenda(text)
    if tipo_prenda:
        filtros["tipoPrenda"] = tipo_prenda

    talla = detectar_talla(text)
    if talla:
        filtros["talla"] = talla

    temporada = detectar_temporada(text)
    if temporada:
        filtros["temporada"] = temporada

    estilo = detectar_estilo(text)
    if estilo:
        filtros["estilo"] = estilo

    material = detectar_material(text)
    if material:
        filtros["material"] = material

    uso = detectar_uso(text)
    if uso:
        filtros["uso"] = uso

    # Condiciones de venta
    condiciones_venta = detectar_condiciones_venta(text)

    # Ordenamiento y límite
    ordenamiento = detectar_ordenamiento(text)
    limite = detectar_limite(text)

    result = {
        "entidad": "productos",
        "formato": formato,
        "rango": {
            "inicio": str(rango[0]),
            "fin": str(rango[1])
        },
        "ordenamiento": ordenamiento,
        "limite": limite
    }

    if filtros:
        result["filtros"] = filtros

    if condiciones_venta:
        result["condicionesVenta"] = condiciones_venta

    return result

