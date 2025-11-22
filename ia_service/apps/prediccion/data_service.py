"""
Servicio para obtener datos del microservicio de negocio (Boutique_back)
para entrenar y hacer predicciones con el modelo de ML
"""

import requests
import pandas as pd
from datetime import datetime, timedelta
from dateutil.relativedelta import relativedelta
import logging

logger = logging.getLogger(__name__)

# URL del servicio de negocio
NEGOCIO_API_URL = "http://localhost:8081/api"


def obtener_datos_historicos_entrenamiento(fecha_desde=None):
    """
    Obtiene datos históricos de ventas de productos para entrenar el modelo

    (MODIFICADO) Llama al endpoint de datos granulares (por mes)
    """
    logger.info("=" * 70)
    logger.info("🌐 OBTENIENDO DATOS HISTÓRICOS (GRANULARES) DEL SERVICIO DE NEGOCIO")
    logger.info("=" * 70)

    hoy = datetime.now().date()

    if fecha_desde is None:
        fecha_inicio = datetime(2023, 1, 1).date()
    else:
        fecha_inicio = fecha_desde

    meses_diff = (hoy.year - fecha_inicio.year) * 12 + (hoy.month - fecha_inicio.month)

    logger.info(f"Período: {fecha_inicio} → {hoy} (~{meses_diff} meses)")

    # 1. Obtener datos de productos (MODIFICADO: Nuevo endpoint)
    #    Este endpoint devuelve datos por mes (producto * mes)
    url_productos = f"{NEGOCIO_API_URL}/reporte/productos-mes"

    params = {
        'desde': str(fecha_inicio),
        'hasta': str(hoy)
        # 'limite' ya no es necesario si la query de Spring los trae todos
    }

    logger.info(f"Consultando: {url_productos}")
    logger.info(f"Parámetros: {params}")

    try:
        # (MODIFICADO: Aumentar timeout por si la query es pesada)
        response = requests.get(url_productos, params=params, timeout=120)
        response.raise_for_status()

        productos_ventas_mes = response.json()
        logger.info(f"Recibidos {len(productos_ventas_mes)} registros (producto × mes)")

    except requests.exceptions.RequestException as e:
        logger.error(f"Error al obtener datos: {e}")
        raise

    if not productos_ventas_mes:
        raise ValueError("No se obtuvieron datos históricos del servicio de negocio")

    # 2. Convertir a DataFrame
    df = pd.DataFrame(productos_ventas_mes)

    logger.info("Columnas recibidas del servicio (ejemplo):")
    if len(df) > 0:
        logger.info(f"   {list(df.columns)}")

    # 3. (NUEVO) Asignar temporada usando el mes real
    #    Ya no necesitamos simularla
    if 'mes' in df.columns:
        logger.info("Asignando temporadas basadas en el mes...")
        df['temporada'] = df['mes'].apply(obtener_temporada)
        logger.info(f"   Temporadas encontradas: {df['temporada'].value_counts().to_dict()}")
    else:
        logger.warning("Columna 'mes' no encontrada. No se pudo asignar temporada.")
        df['temporada'] = 'DESCONOCIDO'

    # 4. (MODIFICADO) La función 'expandir_datos_con_temporadas' SE ELIMINA

    # 5. Validar y limpiar datos
    df_limpio = limpiar_datos(df)

    logger.info("=" * 70)
    logger.info(f"✅ DATOS PREPARADOS: {len(df_limpio)} registros (productos × meses)")
    logger.info(f"📊 Columnas finales: {list(df_limpio.columns)}")
    logger.info("=" * 70)

    return df_limpio

def obtener_datos_para_prediccion(filtros=None):
    """
    Obtiene datos actuales de productos para hacer predicciones

    Args:
        filtros: Diccionario con filtros opcionales (marca, genero, etc.)

    Returns:
        DataFrame con productos listos para predicción
    """
    logger.info("=" * 70)
    logger.info("🌐 OBTENIENDO DATOS ACTUALES PARA PREDICCIÓN")
    logger.info("=" * 70)

    hoy = datetime.now().date()

    # Obtener historial de últimos 3 meses para cada producto
    fecha_inicio = hoy - relativedelta(months=3)

    url_productos = f"{NEGOCIO_API_URL}/reporte/productos"
    params = {
        'desde': str(fecha_inicio),
        'hasta': str(hoy),
        'limite': 5000  # Límite alto para capturar todos los productos
    }

    # Agregar filtros opcionales
    if filtros:
        if 'marca' in filtros:
            params['marca'] = filtros['marca']
        if 'genero' in filtros:
            params['genero'] = filtros['genero']
        if 'tipoPrenda' in filtros:
            params['tipoPrenda'] = filtros['tipoPrenda']

    logger.info(f"Consultando: {url_productos}")
    logger.info(f"Parámetros: {params}")

    try:
        response = requests.get(url_productos, params=params, timeout=30)
        response.raise_for_status()

        productos = response.json()
        logger.info(f"Recibidos {len(productos)} productos")

    except requests.exceptions.RequestException as e:
        logger.error(f"Error al obtener datos: {e}")
        raise

    if not productos:
        raise ValueError("No se obtuvieron productos del servicio de negocio")

    # Convertir a DataFrame
    df = pd.DataFrame(productos)

    # Agregar información temporal (mes/año para predicción)
    proximo_mes = hoy + relativedelta(months=1)
    df['mes'] = proximo_mes.month
    df['año'] = proximo_mes.year

    # Temporada del próximo mes
    df['temporada'] = obtener_temporada(proximo_mes.month)

    # Limpiar datos
    df = limpiar_datos(df)

    logger.info("=" * 70)
    logger.info(f"DATOS PREPARADOS: {len(df)} productos")
    logger.info("=" * 70)

    return df


def limpiar_datos(df):
    """
    Limpia y valida los datos recibidos
    """
    logger.info("Limpiando datos...")

    # Columnas requeridas mínimas
    columnas_requeridas = {
        'productoId': 'int',
        'productoNombre': 'str',
        'marca': 'str',
        'precio': 'float',
        'cantidadVendida': 'int',
        'totalVentas': 'float'
    }

    # Validar que existan las columnas requeridas
    for col, tipo in columnas_requeridas.items():
        if col not in df.columns:
            logger.warning(f"Columna faltante: {col}, agregando con valor por defecto")
            if tipo == 'int':
                df[col] = 0
            elif tipo == 'float':
                df[col] = 0.0
            elif tipo == 'str':
                df[col] = 'DESCONOCIDO'

    if 'anio' in df.columns and 'mes' in df.columns:
        # Si hay columnas de año y mes, mantener duplicados por mes
        df = df.drop_duplicates(subset=['productoId', 'anio', 'mes'], keep='first')
    else:
        # Eliminar duplicados por productoId (mantener el primero)
        df = df.drop_duplicates(subset=['productoId'], keep='first')

    # Eliminar filas con valores nulos en columnas críticas
    df = df.dropna(subset=['productoId', 'precio'])

    if 'cantidadVendida' not in df.columns:
        df['cantidadVendida'] = 0

    # Asegurar tipos correctos
    df['precio'] = pd.to_numeric(df['precio'], errors='coerce').fillna(0)
    df['cantidadVendida'] = pd.to_numeric(df['cantidadVendida'], errors='coerce').fillna(0).astype(int)

    if 'totalVentas' not in df.columns:
        df['totalVentas'] = 0.0
    df['totalVentas'] = pd.to_numeric(df['totalVentas'], errors='coerce').fillna(0)

    # Eliminar productos sin ventas (no sirven para entrenar)
    # df = df[df['cantidadVendida'] > 0]
    # (MODIFICADO: Ahora permitimos productos sin ventas para predicción)

    # Normalizar nombres de marcas/géneros/tipos a UPPERCASE
    if 'marca' in df.columns:
        df['marca'] = df['marca'].astype(str).str.upper()
    if 'genero' in df.columns:
        df['genero'] = df['genero'].astype(str).str.upper()
    if 'tipoPrenda' in df.columns:
        df['tipoPrenda'] = df['tipoPrenda'].astype(str).str.upper()

    logger.info(f"Datos limpios: {len(df)} productos válidos")

    return df


def obtener_temporada(mes):
    """
    Determina la temporada según el mes

    En Bolivia (hemisferio sur):
    - Verano: Diciembre, Enero, Febrero
    - Otoño: Marzo, Abril, Mayo
    - Invierno: Junio, Julio, Agosto
    - Primavera: Septiembre, Octubre, Noviembre
    """
    if mes in [12, 1, 2]:
        return 'VERANO'
    elif mes in [3, 4, 5]:
        return 'OTONO'
    elif mes in [6, 7, 8]:
        return 'INVIERNO'
    else:  # 9, 10, 11
        return 'PRIMAVERA'


def obtener_estadisticas_datos(df):
    """
    Obtiene estadísticas de los datos para validación
    """
    stats = {
        'total_productos': len(df),
        'productos_unicos': df['productoId'].nunique() if 'productoId' in df.columns else 0,
        'marcas_unicas': df['marca'].nunique() if 'marca' in df.columns else 0,
        'cantidad_total_vendida': df['cantidadVendida'].sum() if 'cantidadVendida' in df.columns else 0,
        'ventas_totales': df['totalVentas'].sum() if 'totalVentas' in df.columns else 0,
        'precio_promedio': df['precio'].mean() if 'precio' in df.columns else 0,
        'producto_mas_vendido': df.loc[df['cantidadVendida'].idxmax(), 'productoNombre'] if 'cantidadVendida' in df.columns and len(df) > 0 else None
    }

    logger.info("Estadísticas de los datos:")
    for key, value in stats.items():
        logger.info(f"   {key}: {value}")

    return stats

