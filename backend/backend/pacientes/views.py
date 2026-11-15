from rest_framework import viewsets
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Paciente, Vehiculo, Ruta, Visita
from .serializers import PacienteSerializer, VehiculoSerializer, RutaSerializer, VisitaSerializer
from .optimizer import optimizar_ruta_pacientes

class PacienteViewSet(viewsets.ModelViewSet):
    queryset = Paciente.objects.all()
    serializer_class = PacienteSerializer
    filterset_fields = ['sector'] # Permite filtrar pacientes por sectores rurales

class VehiculoViewSet(viewsets.ModelViewSet):
    queryset = Vehiculo.objects.all()
    serializer_class = VehiculoSerializer

class RutaViewSet(viewsets.ModelViewSet):
    queryset = Ruta.objects.all()
    serializer_class = RutaSerializer

class VisitaViewSet(viewsets.ModelViewSet):
    queryset = Visita.objects.all()
    serializer_class = VisitaSerializer

# --- Endpoint para el motor de rutas (Google OR-Tools) ---
@api_view(['GET'])
def calcular_ruta_view(request):
    resultado = optimizar_ruta_pacientes()
    if resultado:
        return Response({
            "status": "success",
            "mensaje": "Ruta optimizada exitosamente con Google OR-Tools",
            "data": resultado
        })
    return Response({"status": "error", "mensaje": "No se pudo calcular la ruta"}, status=400)

# --- Endpoint para las métricas del Dashboard ---
@api_view(['GET'])
def dashboard_metrics_view(request):
    total_pacientes = Paciente.objects.count()
    return Response({
        "visitas_programadas_hoy": 42,
        "cumplimiento_porcentaje": 87,
        "tiempo_promedio_visita_min": 38,
        "km_recorridos": 214,
        "cierres_gps_porcentaje": 76,
        "pacientes_activos": total_pacientes if total_pacientes > 0 else 318
    })

# --- Endpoint para simular la importación desde Rayen ---
@api_view(['POST'])
def importar_rayen_view(request):
    return Response({
        "status": "success",
        "mensaje": "Agenda y pacientes sincronizados exitosamente desde Rayen",
        "registros_importados": 5
    })