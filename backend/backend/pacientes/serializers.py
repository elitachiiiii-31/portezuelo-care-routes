from rest_framework import serializers
from .models import Paciente, Vehiculo, Ruta, Visita

class PacienteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Paciente
        fields = '__all__'

class VehiculoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vehiculo
        fields = '__all__'

class RutaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ruta
        fields = '__all__'

class VisitaSerializer(serializers.ModelSerializer):
    paciente_nombre = serializers.ReadOnlyField(source='paciente.nombre')
    sector_paciente = serializers.ReadOnlyField(source='paciente.sector')

    class Meta:
        model = Visita
        fields = '__all__'