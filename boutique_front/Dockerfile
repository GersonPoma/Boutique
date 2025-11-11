# ----- Etapa 1: Build (Construcción) -----
# Usamos una imagen de Node.js (Alpine es ligera)
FROM node:20-alpine as build

# Establecemos el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiamos el package.json y package-lock.json
COPY package.json package-lock.json ./

# Instalamos las dependencias
RUN npm install

# Copiamos el resto del código fuente
COPY . .

# Construimos la aplicación para producción
# El script "build" ya está definido en tu package.json
RUN npm run build

# ----- Etapa 2: Serve (Servir) -----
# Usamos una imagen de Nginx para servir los archivos
FROM nginx:alpine

# Copiamos los archivos estáticos construidos en la etapa anterior
# Vite por defecto construye en la carpeta 'dist'
COPY --from=build /app/dist /usr/share/nginx/html

# Copiamos una configuración personalizada de Nginx (Paso 1.1)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exponemos el puerto 80 (default de Nginx)
EXPOSE 80