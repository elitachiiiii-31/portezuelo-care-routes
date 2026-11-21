from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('pacientes.urls')),  # <--- Esto incluye todo lo que esté en pacientes/urls.py bajo el prefijo /api/
]