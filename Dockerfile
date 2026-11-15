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

# Exponer el puerto
EXPOSE 8080 

# Comando para iniciar
CMD ["npm", "run", "dev"]