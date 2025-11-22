import io
import requests
import pandas as pd
from reportlab.lib.pagesizes import landscape, letter
from reportlab.pdfgen import canvas
from datetime import datetime
from django.http import FileResponse

# Cambia esto por la URL real de tu servicio de negocio
NEGOCIO_API_URL = "http://localhost:8081/api/reporte/ventas"
# NEGOCIO_API_URL = "http://boutique-back:8081/api/reporte/ventas"


def generar_reporte_ventas(parametros):
    """
    parámetros esperados (del NLP):
    {
      'condiciones': {'tipoPago': 'CREDITO', 'estado': 'PAGANDO_CREDITO'},
      'condicionMonto': {'operador': 'mayor', 'valor': 1000},
      'rango': {'inicio': '2025-08-01', 'fin': '2025-11-10'},
      'formato': 'pdf'
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

    # Condiciones opcionales - Solo agregar si existen y no son None
    if "condiciones" in parametros and parametros["condiciones"]:
        if "tipoPago" in parametros["condiciones"] and parametros["condiciones"]["tipoPago"]:
            params["tipoPago"] = parametros["condiciones"]["tipoPago"]
        if "estado" in parametros["condiciones"] and parametros["condiciones"]["estado"]:
            params["estadoVenta"] = parametros["condiciones"]["estado"]
        if "tipoVenta" in parametros["condiciones"] and parametros["condiciones"]["tipoVenta"]:
            params["tipoVenta"] = parametros["condiciones"]["tipoVenta"]

    # Monto (si aplica) - Solo agregar si existe y tiene valor
    if "condicionMonto" in parametros and parametros["condicionMonto"]:
        cond = parametros["condicionMonto"]
        if "operador" in cond and "valor" in cond and cond["valor"] is not None:
            if cond["operador"] == "mayor":
                params["montoMinimo"] = cond["valor"]
            elif cond["operador"] == "menor":
                params["montoMaximo"] = cond["valor"]

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
        # e.response contiene el objeto response
        error_detail = e.response.text if hasattr(e.response, 'text') else str(e)
        raise requests.exceptions.RequestException(f"Error HTTP del servicio de negocio: {e.response.status_code} - {error_detail}")

    ventas = response.json()

    # Generar el reporte
    formato = parametros.get("formato", "excel").lower()
    if formato == "excel":
        return generar_excel(ventas)
    elif formato == "pdf":
        return generar_pdf(ventas)
    else:
        raise ValueError(f"Formato de reporte no soportado: '{formato}'. Use 'excel' o 'pdf'")


# --------------------------------------------------------------------
# EXCEL
# --------------------------------------------------------------------
def generar_excel(ventas):
    if not ventas:
        raise ValueError("No hay datos para generar el reporte.")

    df = pd.DataFrame(ventas)
    columnas = ["id", "fecha", "hora", "clienteNombre", "tipoVenta", "tipoPago", "estado", "total"]
    df = df[columnas]

    # Renombrar columnas a algo más legible
    df.rename(columns={
        "id": "Nro",
        "fecha": "Fecha",
        "hora": "Hora",
        "clienteNombre": "Cliente",
        "tipoVenta": "Tipo de Venta",
        "tipoPago": "Tipo de Pago",
        "estado": "Estado",
        "total": "Total (Bs)"
    }, inplace=True)

    buffer = io.BytesIO()
    with pd.ExcelWriter(buffer, engine='openpyxl') as writer:
        df.to_excel(writer, index=False, sheet_name='ReporteVentas')

        # Obtener la hoja de trabajo
        worksheet = writer.sheets['ReporteVentas']

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
        filename=f"reporte_ventas_{datetime.now().strftime('%Y%m%d_%H%M')}.xlsx"
    )


# --------------------------------------------------------------------
# PDF
# --------------------------------------------------------------------
def generar_pdf(ventas):
    if not ventas:
        raise ValueError("No hay datos para generar el reporte.")

    # Usamos tamaño carta (letter)
    buffer = io.BytesIO()
    p = canvas.Canvas(buffer, pagesize=landscape(letter))
    width, height = landscape(letter)

    # Encabezado
    p.setFont("Helvetica-Bold", 16)
    p.drawString(30, height - 40, "Reporte de Ventas")
    p.setFont("Helvetica", 10)
    p.drawString(30, height - 60, f"Generado: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

    # Encabezados de tabla
    y = height - 90
    headers = ["Nro", "Fecha", "Cliente", "Tipo Venta", "Tipo Pago", "Estado", "Total (Bs)"]
    x_positions = [30, 80, 160, 300, 400, 500, 620]

    p.setFont("Helvetica-Bold", 10)
    for i, h in enumerate(headers):
        p.drawString(x_positions[i], y, h)

    y -= 15
    p.setFont("Helvetica", 9)

    # Filas de datos
    total_general = 0
    for v in ventas:
        if y < 60:  # salto de página
            p.showPage()
            p.setFont("Helvetica-Bold", 10)
            y = height - 50
            for i, h in enumerate(headers):
                p.drawString(x_positions[i], y, h)
            y -= 15
            p.setFont("Helvetica", 9)

        p.drawString(x_positions[0], y, str(v.get("id", "")))
        p.drawString(x_positions[1], y, str(v.get("fecha", "")))
        p.drawString(x_positions[2], y, str(v.get("clienteNombre", ""))[:25])
        p.drawString(x_positions[3], y, v.get("tipoVenta", ""))
        p.drawString(x_positions[4], y, v.get("tipoPago", ""))
        p.drawString(x_positions[5], y, v.get("estado", ""))
        p.drawRightString(x_positions[6] + 40, y, f"{float(v.get('total', 0)):.2f}")

        total_general += float(v.get("total", 0))
        y -= 14

    # Resumen al final
    if y < 80:
        p.showPage()
        y = height - 60

    p.setFont("Helvetica-Bold", 11)
    p.drawString(30, y - 20, "Resumen del Reporte:")
    p.setFont("Helvetica", 10)
    p.drawString(50, y - 40, f"Cantidad total de ventas: {len(ventas)}")
    p.drawString(50, y - 55, f"Total general (Bs): {total_general:.2f}")

    p.save()
    buffer.seek(0)

    return FileResponse(
        buffer,
        as_attachment=True,
        filename=f"reporte_ventas_{datetime.now().strftime('%Y%m%d_%H%M')}.pdf"
    )
