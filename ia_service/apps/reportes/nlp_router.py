import spacy

nlp = spacy.load("es_core_news_md")

"""
Detecta la intención del texto usando NLP.
Retorna 'ventas' si el texto está relacionado con reportes de ventas,
o 'productos' si está relacionado con reportes de productos.
"""
def detectar_intencion(text):
    doc = nlp(text.lower())

    lemas_ventas = ["venta", "ventas", "cancelada", "canceladas", "pendiente", ]
    lemas_productos = [
        "producto", "prenda", "ropa", "marca", "talla", "stock", "inventario",
        "modelo", "estilo", "material", "zapatilla", "camisa", "pantalón",
        "algodón", "cuero", "nike", "adidas", "puma", "cantidad"
    ]

    score_ventas = 0
    score_productos = 0

    # Frases compuestas clave
    text_str = text.lower()
    if ("más vendido" in text_str or "mas vendido" in text_str or "top" in text_str or "más vendidos" in text_str
            or "mas vendidos" in text_str or "más vendidas" in text_str or "mas vendidas" in text_str):
        score_productos += 2

    for token in doc:
        if token.lemma_ in lemas_ventas:
            score_ventas += 1
        elif token.lemma_ in lemas_productos:
            score_productos += 1

    if score_productos > score_ventas:
        return "productos"
    else:
        return "ventas"