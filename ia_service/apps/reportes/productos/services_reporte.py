"""
Servicio para generar reportes de productos más vendidos
Combina datos de Venta, DetalleVenta y Producto
"""
import io
import requests
import pandas as pd
from reportlab.lib.pagesizes import landscape, letter
from reportlab.pdfgen import canvas
from datetime import datetime
from django.http import FileResponse

# URL del servicio de negocio
NEGOCIO_API_URL = "http://localhost:8081/api/reporte/productos"
# NEGOCIO_API_URL = "http://boutique-back:8081/api/reporte/productos"

def generar_reporte_productos(parametros):
    """
    Genera reporte de productos más vendidos

    Parámetros esperados del NLP:
    {
        'entidad': 'productos',
        'formato': 'excel',
        'rango': {'inicio': '2025-11-01', 'fin': '2025-11-11'},
        'filtros': {
            'marca': 'NIKE',
            'genero': 'MASCULINO',
            'tipoPrenda': 'ZAPATILLA'
        },
        'condicionesVenta': {
            'tipoVenta': 'ONLINE',
            'tipoPago': 'CREDITO'
        },
        'ordenamiento': {'campo': 'cantidadVendida', 'orden': 'DESC'},
        'limite': 10
    }
    """
    # Validar que exista el rango de fechas
    if "rango" not in parametros or not parametros["rango"]:
        raise ValueError("Se requiere un rango de fechas para generar el reporte")

    if "inicio" not in parametros["rango"] or "fin" not in parametros["rango"]:
        raise ValueError("El rango de fechas debe incluir 'inicio' y 'fin'")

    params = {}

    # Rango de fechas (obligatorios)
    params["desde"] = parametros["rango"]["inicio"]
    params["hasta"] = parametros["rango"]["fin"]

    # Filtros de producto (opcionales)
    if "filtros" in parametros and parametros["filtros"]:
        if "marca" in parametros["filtros"] and parametros["filtros"]["marca"]:
            params["marca"] = parametros["filtros"]["marca"]
        if "genero" in parametros["filtros"] and parametros["filtros"]["genero"]:
            params["genero"] = parametros["filtros"]["genero"]
        if "tipoPrenda" in parametros["filtros"] and parametros["filtros"]["tipoPrenda"]:
            params["tipoPrenda"] = parametros["filtros"]["tipoPrenda"]
        if "talla" in parametros["filtros"] and parametros["filtros"]["talla"]:
            params["talla"] = parametros["filtros"]["talla"]
        if "temporada" in parametros["filtros"] and parametros["filtros"]["temporada"]:
            params["temporada"] = parametros["filtros"]["temporada"]
        if "estilo" in parametros["filtros"] and parametros["filtros"]["estilo"]:
            params["estilo"] = parametros["filtros"]["estilo"]
        if "material" in parametros["filtros"] and parametros["filtros"]["material"]:
            params["material"] = parametros["filtros"]["material"]
        if "uso" in parametros["filtros"] and parametros["filtros"]["uso"]:
            params["uso"] = parametros["filtros"]["uso"]

    # Condiciones de venta (opcionales)
    if "condicionesVenta" in parametros and parametros["condicionesVenta"]:
        if "tipoVenta" in parametros["condicionesVenta"] and parametros["condicionesVenta"]["tipoVenta"]:
            params["tipoVenta"] = parametros["condicionesVenta"]["tipoVenta"]
        if "tipoPago" in parametros["condicionesVenta"] and parametros["condicionesVenta"]["tipoPago"]:
            params["tipoPago"] = parametros["condicionesVenta"]["tipoPago"]
        if "estadoVenta" in parametros["condicionesVenta"] and parametros["condicionesVenta"]["estadoVenta"]:
            params["estadoVenta"] = parametros["condicionesVenta"]["estadoVenta"]

    # Ordenamiento
    if "ordenamiento" in parametros:
        params["ordenarPor"] = parametros["ordenamiento"]["campo"]
        params["orden"] = parametros["ordenamiento"]["orden"]

    # Límite
    if "limite" in parametros:
        params["limite"] = parametros["limite"]

    # Llamada al microservicio del negocio
    print(f"Parámetros enviados al servicio de negocio: {params}")
    try:
        response = requests.get(NEGOCIO_API_URL, params=params, timeout=10)
        response.raise_for_status()
    except requests.exceptions.Timeout:
        raise requests.exceptions.RequestException("Tiempo de espera agotado al conectar con el servicio de negocio")
    except requests.exceptions.ConnectionError:
        raise requests.exceptions.RequestException("No se pudo conectar con el servicio de negocio. Verifique que esté en ejecución")
    except requests.exceptions.HTTPError as e:
        error_detail = e.response.text if hasattr(e.response, 'text') else str(e)
        raise requests.exceptions.RequestException(f"Error HTTP del servicio de negocio: {e.response.status_code} - {error_detail}")

    productos = response.json()

    # Generar el reporte
    formato = parametros.get("formato", "excel").lower()
    if formato == "excel":
        return generar_excel(productos)
    elif formato == "pdf":
        return generar_pdf(productos)
    else:
        raise ValueError(f"Formato de reporte no soportado: '{formato}'. Use 'excel' o 'pdf'")


# --------------------------------------------------------------------
# EXCEL
# --------------------------------------------------------------------
def generar_excel(productos):
    if not productos:
        raise ValueError("No hay datos para generar el reporte.")

    df = pd.DataFrame(productos)

    # Definir columnas esperadas
    columnas = ["productoId", "productoNombre", "marca", "precio", "cantidadVendida", "totalVentas"]
    df = df[columnas]

    # Renombrar columnas a algo más legible
    df.rename(columns={
        "productoId": "ID",
        "productoNombre": "Producto",
        "marca": "Marca",
        "precio": "Precio (Bs)",
        "cantidadVendida": "Cantidad Vendida",
        "totalVentas": "Total Ventas (Bs)"
    }, inplace=True)

    buffer = io.BytesIO()
    with pd.ExcelWriter(buffer, engine='openpyxl') as writer:
        df.to_excel(writer, index=False, sheet_name='ProductosMasVendidos')

        # Obtener la hoja de trabajo
        worksheet = writer.sheets['ProductosMasVendidos']

        # Ajustar el ancho de cada columna al contenido más largo
        for idx, col in enumerate(df.columns):
            # Calcular el ancho máximo entre el título y los datos
            max_length = len(str(col))  # Longitud del título

            # Verificar la longitud máxima de los datos en la columna
            column_values = df[col].astype(str)
            if len(column_values) > 0:
                max_length = max(max_length, column_values.str.len().max())

            # Agregar un pequeño margen y establecer el ancho
            adjusted_width = min(max_length + 2, 50)  # Máximo 50 caracteres
            worksheet.column_dimensions[chr(65 + idx)].width = adjusted_width

    buffer.seek(0)

    return FileResponse(
        buffer,
        as_attachment=True,
        filename=f"reporte_productos_{datetime.now().strftime('%Y%m%d_%H%M')}.xlsx"
    )


# --------------------------------------------------------------------
# PDF
# --------------------------------------------------------------------
def generar_pdf(productos):
    if not productos:
        raise ValueError("No hay datos para generar el reporte.")

    buffer = io.BytesIO()
    p = canvas.Canvas(buffer, pagesize=landscape(letter))
    width, height = landscape(letter)

    # Encabezado
    p.setFont("Helvetica-Bold", 16)
    p.drawString(30, height - 40, "Reporte de Productos Más Vendidos")
    p.setFont("Helvetica", 10)
    p.drawString(30, height - 60, f"Generado: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

    # Encabezados de tabla
    y = height - 90
    headers = ["ID", "Producto", "Marca", "Precio (Bs)", "Cant. Vendida", "Total Ventas (Bs)"]
    x_positions = [30, 80, 280, 380, 480, 600]

    p.setFont("Helvetica-Bold", 10)
    for i, h in enumerate(headers):
        p.drawString(x_positions[i], y, h)

    y -= 15
    p.setFont("Helvetica", 9)

    # Filas de datos
    total_general_cantidad = 0
    total_general_ventas = 0

    for prod in productos:
        if y < 60:  # salto de página
            p.showPage()
            p.setFont("Helvetica-Bold", 10)
            y = height - 50
            for i, h in enumerate(headers):
                p.drawString(x_positions[i], y, h)
            y -= 15
            p.setFont("Helvetica", 9)

        p.drawString(x_positions[0], y, str(prod.get("productoId", "")))
        p.drawString(x_positions[1], y, str(prod.get("productoNombre", ""))[:30])
        p.drawString(x_positions[2], y, str(prod.get("marca", "")))
        p.drawRightString(x_positions[3] + 60, y, f"{float(prod.get('precio', 0)):.2f}")
        p.drawRightString(x_positions[4] + 60, y, str(prod.get("cantidadVendida", 0)))
        p.drawRightString(x_positions[5] + 60, y, f"{float(prod.get('totalVentas', 0)):.2f}")

        total_general_cantidad += int(prod.get("cantidadVendida", 0))
        total_general_ventas += float(prod.get("totalVentas", 0))
        y -= 14

    # Resumen al final
    if y < 80:
        p.showPage()
        y = height - 60

    p.setFont("Helvetica-Bold", 11)
    p.drawString(30, y - 20, "Resumen del Reporte:")
    p.setFont("Helvetica", 10)
    p.drawString(50, y - 40, f"Total productos: {len(productos)}")
    p.drawString(50, y - 55, f"Total unidades vendidas: {total_general_cantidad}")
    p.drawString(50, y - 70, f"Total en ventas (Bs): {total_general_ventas:.2f}")

    p.save()
    buffer.seek(0)

    return FileResponse(
        buffer,
        as_attachment=True,
        filename=f"reporte_productos_{datetime.now().strftime('%Y%m%d_%H%M')}.pdf"
    )

