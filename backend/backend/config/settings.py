"""
Django settings for config project.
"""

from pathlib import Path
import os
import environ

# 1. Construir la ruta base del proyecto (apuntando a la raíz donde está manage.py / .env)
BASE_DIR = Path(__file__).resolve().parent.parent.parent

# 2. Inicializar las variables de entorno y leer explícitamente el archivo .env
env = environ.Env()
environ.Env.read_env(os.path.join(BASE_DIR, '.env'))

# 3. Cargar la API de Google Maps de forma segura
GOOGLE_MAPS_API_KEY = env('GOOGLE_MAPS_API_KEY', default='')

# Quick-start development settings - unsuitable for production
SECRET_KEY = 'django-insecure-#$4(cg@5b8-&_ij5hqrbfugu8t1o5r1v%cn^77q$r1ml!j(a03'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = ['*'] # Permitir que Docker se conecte sin problemas

# Application definition
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'pacientes', # Tu aplicación
    'corsheaders', # Para conectar con el frontend después
    'rest_framework', # Para tu API
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware', # Middleware de CORS
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'config.wsgi.application'

# Database conectada a Supabase mediante variables de entorno
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': env('DB_NAME', default='postgres'),
        'USER': env('DB_USER', default='postgres'),
        'PASSWORD': env('DB_PASSWORD'),
        'HOST': env('DB_HOST'),
        'PORT': env('DB_PORT', default='5432'),
    }
}

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

# Internationalization
LANGUAGE_CODE = 'es-es'
TIME_ZONE = 'America/Santiago'
USE_I18N = True
USE_TZ = True

# Static files (CSS, JavaScript, Images)
STATIC_URL = 'static/'

# Default primary key field type
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Permitir que cualquier frontend se conecte (útil para desarrollo)
CORS_ALLOW_ALL_ORIGINS = True