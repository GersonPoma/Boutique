# Usamos la imagen base completa de Python 3.10 (como sugeriste)
FROM python:3.10

# Esta imagen ya suele incluir las herramientas de compilación,
# por lo que no necesitamos el paso 'apt-get install'

# Establecemos variables de entorno para Python
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Creamos y establecemos el directorio de trabajo
WORKDIR /app

# Copiamos el archivo de requerimientos (que acabas de corregir)
COPY requirements.txt .

# Actualizamos pip e instalamos las dependencias
RUN pip install --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt

# Copiamos todo el proyecto al contenedor
COPY . .

# Exponemos el puerto 8000
EXPOSE 8000

# Comando para iniciar el servidor de desarrollo de Django
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]