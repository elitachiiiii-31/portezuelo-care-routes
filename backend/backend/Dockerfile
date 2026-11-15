# Usar una imagen ligera de Python
FROM python:3.10-slim

# Evitar que Python genere archivos .pyc y forzar la salida directa a la consola
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Establecer el directorio de trabajo dentro del contenedor del backend
WORKDIR /app

# Instalar dependencias del sistema necesarias para PostgreSQL
RUN apt-get update \
    && apt-get install -y gcc libpq-dev \
    && apt-get clean

# Copiar dependencias (asegúrate de tener un requirements.txt dentro de la carpeta backend)
COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

# Copiar el código del backend
COPY . /app/

# Exponer el puerto de Django
EXPOSE 8000

# Iniciar el servidor
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]