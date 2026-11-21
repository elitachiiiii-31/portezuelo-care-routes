from django.contrib import admin
from .models import Paciente, Vehiculo, Ruta, Visita

admin.site.register(Paciente)
admin.site.register(Vehiculo)
admin.site.register(Ruta)
admin.site.register(Visita)