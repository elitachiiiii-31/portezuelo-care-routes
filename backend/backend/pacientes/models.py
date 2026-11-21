from django.db import models

class Paciente(models.Model):
    SECTORES_CHOICES = [
        ('Portezuelo Urbano', 'Portezuelo Urbano'),
        ('Cucha Cucha', 'Cucha Cucha'),
        ('Llahuecuy', 'Llahuecuy'),
        ('Buenos Aires', 'Buenos Aires'),
        ('Chudal', 'Chudal'),
        ('Tauco', 'Tauco'),
    ]
    nombre = models.CharField(max_length=150)
    direccion_rural = models.TextField()
    sector = models.CharField(max_length=50, choices=SECTORES_CHOICES, default='Portezuelo Urbano')
    latitud = models.FloatField()
    longitud = models.FloatField()
    req_clinico = models.TextField(blank=True, null=True)
    prioridad = models.CharField(max_length=20, default='Media') # Alta, Media, Baja

    def __str__(self):
        return f"{self.nombre} - {self.sector}"

class Vehiculo(models.Model):
    patente = models.CharField(max_length=20)
    modelo = models.CharField(max_length=50)
    conductor = models.CharField(max_length=100)

    def __str__(self):
        return f"{self.modelo} ({self.patente})"

class Ruta(models.Model):
    fecha = models.DateField(auto_now_add=True)
    vehiculo = models.ForeignKey(Vehiculo, on_delete=models.CASCADE)
    distancia_total_metros = models.IntegerField(default=0)
    optimizada = models.BooleanField(default=True)

class Visita(models.Model):
    ESTADOS = [
        ('Pendiente', 'Pendiente'),
        ('En ruta', 'En ruta'),
        ('En visita', 'En visita'),
        ('Completada', 'Completada'),
    ]
    ruta = models.ForeignKey(Ruta, on_delete=models.CASCADE, related_name='visitas', null=True, blank=True)
    paciente = models.ForeignKey(Paciente, on_delete=models.CASCADE)
    estado = models.CharField(max_length=20, choices=ESTADOS, default='Pendiente')
    hora_programada = models.TimeField(null=True, blank=True)
    tipo_cierre = models.CharField(max_length=30, blank=True, null=True) # GPS automático / Manual
    distancia_domicilio_m = models.IntegerField(default=0)
    justificacion = models.TextField(blank=True, null=True)