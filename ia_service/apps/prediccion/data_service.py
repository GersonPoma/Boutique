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

def obtener_datos_para_prediccion(filtros=None, fecha_inicio_prediccion=None, fecha_fin_prediccion=None):
    """
    Obtiene datos para hacer predicciones usando ENFOQUE HÍBRIDO:
    1. Datos estacionales: mismos meses de años anteriores
    2. Datos recientes: últimos 3 meses para capturar tendencias actuales

    Args:
        filtros: Diccionario con filtros opcionales (marca, genero, etc.)
        fecha_inicio_prediccion: Fecha inicial del periodo FUTURO a predecir
        fecha_fin_prediccion: Fecha final del periodo FUTURO a predecir

    Returns:
        DataFrame con productos listos para predicción
    """
    logger.info("=" * 70)
    logger.info("🌐 OBTENIENDO DATOS PARA PREDICCIÓN (ENFOQUE HÍBRIDO)")
    logger.info("=" * 70)

    hoy = datetime.now().date()

    # Si no se especifican fechas futuras, usar el próximo mes
    if fecha_inicio_prediccion is None or fecha_fin_prediccion is None:
        proximo_mes = hoy + relativedelta(months=1)
        fecha_inicio_prediccion = proximo_mes.replace(day=1)
        fecha_fin_prediccion = (fecha_inicio_prediccion + relativedelta(months=1, days=-1))

    logger.info(f"📅 Prediciendo para: {fecha_inicio_prediccion} → {fecha_fin_prediccion}")

    # ========================================================================
    # ESTRATEGIA HÍBRIDA: Combinar datos estacionales + datos recientes
    # ========================================================================

    # 1. DATOS ESTACIONALES: Obtener datos de los MISMOS MESES de años anteriores
    logger.info("📊 PASO 1: Obteniendo datos ESTACIONALES (mismos meses de años anteriores)...")
    df_estacionales = obtener_datos_estacionales(
        fecha_inicio_prediccion,
        fecha_fin_prediccion,
        filtros
    )

    # 2. DATOS RECIENTES: Obtener últimos 3 meses para capturar tendencias actuales
    logger.info("📈 PASO 2: Obteniendo datos RECIENTES (últimos 3 meses)...")
    df_recientes = obtener_datos_recientes(filtros)

    # 3. COMBINAR AMBOS DATASETS
    logger.info("🔗 PASO 3: Combinando datos estacionales + recientes...")
    df_combinado = combinar_datos_prediccion(df_estacionales, df_recientes)

    # 4. Asignar mes/año/temporada del periodo a predecir
    mes_inicio = fecha_inicio_prediccion.month
    mes_fin = fecha_fin_prediccion.month
    año_inicio = fecha_inicio_prediccion.year
    año_fin = fecha_fin_prediccion.year

    if mes_inicio == mes_fin and año_inicio == año_fin:
        df_combinado['mes'] = mes_inicio
        df_combinado['año'] = año_inicio
        temporada_prediccion = obtener_temporada(mes_inicio)
    else:
        # Si abarca múltiples meses, usar el mes central
        fecha_central = fecha_inicio_prediccion + (fecha_fin_prediccion - fecha_inicio_prediccion) / 2
        df_combinado['mes'] = fecha_central.month
        df_combinado['año'] = fecha_central.year
        temporada_prediccion = obtener_temporada(fecha_central.month)

    logger.info(f"🌡️  Temporada de predicción: {temporada_prediccion}")
    df_combinado['temporada'] = temporada_prediccion

    # 5. Limpiar datos
    df_combinado = limpiar_datos(df_combinado)

    logger.info("=" * 70)
    logger.info(f"✅ DATOS PREPARADOS: {len(df_combinado)} productos")
    logger.info(f"   📊 Estacionales: {len(df_estacionales)} registros")
    logger.info(f"   📈 Recientes: {len(df_recientes)} registros")
    logger.info("=" * 70)

    return df_combinado


def obtener_datos_estacionales(fecha_inicio_prediccion, fecha_fin_prediccion, filtros=None):
    """
    Obtiene datos de los MISMOS MESES de años anteriores

    Ejemplo: Si predices para diciembre 2025, trae diciembres de 2023 y 2024
    Esto captura la estacionalidad específica del periodo
    """
    logger.info("   🗓️  Extrayendo meses del periodo de predicción...")

    # Extraer todos los meses del rango de predicción
    meses_prediccion = set()
    fecha_actual = fecha_inicio_prediccion
    while fecha_actual <= fecha_fin_prediccion:
        meses_prediccion.add(fecha_actual.month)
        fecha_actual += relativedelta(months=1)

    logger.info(f"   🗓️  Meses a predecir: {sorted(meses_prediccion)}")

    # Obtener datos de esos MISMOS meses de TODOS los años históricos disponibles
    # Desde 2023 (inicio del sistema) hasta el año anterior
    año_actual = datetime.now().year
    año_inicio_sistema = 2023  # Año desde que tenemos datos

    # Generar lista de todos los años históricos
    años_historicos = list(range(año_inicio_sistema, año_actual))

    # Si estamos en el mismo año que el inicio, usar solo el año anterior si existe
    if not años_historicos:
        años_historicos = [año_actual - 1] if año_actual > año_inicio_sistema else []

    logger.info(f"   📚 Buscando en años: {años_historicos} (todos los años históricos disponibles)")

    # Construir lista de rangos de fechas para cada mes histórico
    rangos_fechas = []
    for año in años_historicos:
        for mes in sorted(meses_prediccion):
            fecha_inicio_mes = datetime(año, mes, 1).date()
            fecha_fin_mes = (fecha_inicio_mes + relativedelta(months=1, days=-1))

            # Solo si la fecha no es futura
            if fecha_fin_mes < datetime.now().date():
                rangos_fechas.append((fecha_inicio_mes, fecha_fin_mes))

    if not rangos_fechas:
        logger.warning("   ⚠️  No hay datos históricos de esos meses, usando fallback")
        return pd.DataFrame()

    logger.info(f"   📅 Rangos de fechas estacionales: {len(rangos_fechas)} periodos")

    # Obtener datos para cada rango y combinarlos
    dataframes = []
    url_productos = f"{NEGOCIO_API_URL}/reporte/productos"

    for fecha_inicio, fecha_fin in rangos_fechas:
        params = {
            'desde': str(fecha_inicio),
            'hasta': str(fecha_fin),
            'limite': 5000
        }

        # Agregar filtros opcionales
        if filtros:
            if 'marca' in filtros:
                params['marca'] = filtros['marca']
            if 'genero' in filtros:
                params['genero'] = filtros['genero']
            if 'tipoPrenda' in filtros:
                params['tipoPrenda'] = filtros['tipoPrenda']

        try:
            response = requests.get(url_productos, params=params, timeout=30)
            response.raise_for_status()
            productos = response.json()

            if productos:
                dataframes.append(pd.DataFrame(productos))
                logger.info(f"      ✓ {fecha_inicio} a {fecha_fin}: {len(productos)} productos")

        except requests.exceptions.RequestException as e:
            logger.warning(f"      ✗ Error al obtener {fecha_inicio} a {fecha_fin}: {e}")
            continue

    if not dataframes:
        logger.warning("   ⚠️  No se obtuvieron datos estacionales")
        return pd.DataFrame()

    # Combinar todos los dataframes
    df_estacional = pd.concat(dataframes, ignore_index=True)

    # Agregar o sumar ventas por producto (si se repite en varios periodos)
    if 'productoId' in df_estacional.columns:
        # Construir diccionario de agregación solo con columnas que existen
        agg_dict = {
            'cantidadVendida': 'sum',  # Sumar cantidades de todos los periodos
            'totalVentas': 'sum',  # Sumar ventas totales
            'precio': 'mean',  # Precio promedio
        }

        # Agregar columnas opcionales si existen
        columnas_opcionales = {
            'productoNombre': 'first',
            'marca': 'first',
            'genero': 'first',
            'tipoPrenda': 'first',
            'talla': 'first',
            'temporada': 'first',
            'material': 'first',
            'uso': 'first'
        }

        for col, func in columnas_opcionales.items():
            if col in df_estacional.columns:
                agg_dict[col] = func

        df_estacional = df_estacional.groupby('productoId').agg(agg_dict).reset_index()

    logger.info(f"   ✅ Datos estacionales: {len(df_estacional)} productos únicos")

    return df_estacional


def obtener_datos_recientes(filtros=None):
    """
    Obtiene datos de los ÚLTIMOS 3 MESES
    Esto captura tendencias actuales y productos nuevos
    """
    logger.info("   📆 Obteniendo últimos 3 meses...")

    hoy = datetime.now().date()
    fecha_inicio_reciente = hoy - relativedelta(months=3)

    url_productos = f"{NEGOCIO_API_URL}/reporte/productos"
    params = {
        'desde': str(fecha_inicio_reciente),
        'hasta': str(hoy),
        'limite': 5000
    }

    # Agregar filtros opcionales
    if filtros:
        if 'marca' in filtros:
            params['marca'] = filtros['marca']
        if 'genero' in filtros:
            params['genero'] = filtros['genero']
        if 'tipoPrenda' in filtros:
            params['tipoPrenda'] = filtros['tipoPrenda']

    try:
        response = requests.get(url_productos, params=params, timeout=30)
        response.raise_for_status()
        productos = response.json()

        if productos:
            df_reciente = pd.DataFrame(productos)
            logger.info(f"   ✅ Datos recientes: {len(df_reciente)} productos")
            return df_reciente
        else:
            logger.warning("   ⚠️  No se obtuvieron datos recientes")
            return pd.DataFrame()

    except requests.exceptions.RequestException as e:
        logger.warning(f"   ✗ Error al obtener datos recientes: {e}")
        return pd.DataFrame()


def combinar_datos_prediccion(df_estacionales, df_recientes):
    """
    Combina datos estacionales y recientes, priorizando estacionales
    """
    if df_estacionales.empty and df_recientes.empty:
        raise ValueError("No se obtuvieron datos ni estacionales ni recientes")

    if df_estacionales.empty:
        logger.info("   ⚠️  Solo usando datos recientes (sin historial estacional)")
        return df_recientes

    if df_recientes.empty:
        logger.info("   ℹ️  Solo usando datos estacionales")
        return df_estacionales

    # ESTRATEGIA: Priorizar datos estacionales, complementar con recientes
    # Si un producto está en ambos, usar promedio ponderado (70% estacional, 30% reciente)

    logger.info("   🔗 Combinando datasets...")

    # Identificar productos comunes
    productos_estacionales = set(df_estacionales['productoId'].unique()) if 'productoId' in df_estacionales.columns else set()
    productos_recientes = set(df_recientes['productoId'].unique()) if 'productoId' in df_recientes.columns else set()

    productos_comunes = productos_estacionales.intersection(productos_recientes)
    productos_solo_estacionales = productos_estacionales - productos_recientes
    productos_solo_recientes = productos_recientes - productos_estacionales

    logger.info(f"      📊 Productos comunes: {len(productos_comunes)}")
    logger.info(f"      📊 Solo en estacionales: {len(productos_solo_estacionales)}")
    logger.info(f"      📊 Solo en recientes: {len(productos_solo_recientes)}")

    dataframes_combinar = []

    # 1. Productos comunes: promedio ponderado
    if productos_comunes and 'productoId' in df_estacionales.columns and 'productoId' in df_recientes.columns:
        df_comunes_est = df_estacionales[df_estacionales['productoId'].isin(productos_comunes)].copy()
        df_comunes_rec = df_recientes[df_recientes['productoId'].isin(productos_comunes)].copy()

        # Merge para combinar
        df_comunes = df_comunes_est.merge(
            df_comunes_rec[['productoId', 'cantidadVendida', 'totalVentas']],
            on='productoId',
            how='left',
            suffixes=('_est', '_rec')
        )

        # Promedio ponderado: 70% estacional, 30% reciente
        df_comunes['cantidadVendida'] = (
            df_comunes['cantidadVendida_est'] * 0.7 +
            df_comunes.get('cantidadVendida_rec', 0).fillna(0) * 0.3
        ).astype(int)

        df_comunes['totalVentas'] = (
            df_comunes['totalVentas_est'] * 0.7 +
            df_comunes.get('totalVentas_rec', 0).fillna(0) * 0.3
        )

        # Limpiar columnas auxiliares
        df_comunes = df_comunes.drop(columns=[col for col in df_comunes.columns if col.endswith('_est') or col.endswith('_rec')])
        dataframes_combinar.append(df_comunes)

    # 2. Productos solo en estacionales
    if productos_solo_estacionales and 'productoId' in df_estacionales.columns:
        df_solo_est = df_estacionales[df_estacionales['productoId'].isin(productos_solo_estacionales)].copy()
        dataframes_combinar.append(df_solo_est)

    # 3. Productos solo en recientes (productos nuevos)
    if productos_solo_recientes and 'productoId' in df_recientes.columns:
        df_solo_rec = df_recientes[df_recientes['productoId'].isin(productos_solo_recientes)].copy()
        dataframes_combinar.append(df_solo_rec)

    if not dataframes_combinar:
        # Fallback: usar estacionales si existe
        return df_estacionales if not df_estacionales.empty else df_recientes

    df_final = pd.concat(dataframes_combinar, ignore_index=True)

    logger.info(f"   ✅ Dataset combinado: {len(df_final)} productos")

    return df_final


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

