# Usar una imagen de Node
FROM node:20-alpine

# Establecer el directorio de trabajo
WORKDIR /app

# Copiar los archivos de dependencias
COPY package.json ./

# Instalar las dependencias
RUN npm install

# Copiar el resto del código
COPY . .

# Compilar la aplicación para producción
RUN npm run build

# Instalar un servidor estático ligero para producción
RUN npm install -g serve

# Exponer el puerto
EXPOSE 8080 

# Comando para servir la carpeta de producción (dist)
CMD ["serve", "-s", "dist", "-l", "8080"]