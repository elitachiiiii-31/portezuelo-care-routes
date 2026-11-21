from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    PacienteViewSet, 
    VehiculoViewSet, 
    RutaViewSet, 
    VisitaViewSet, 
    calcular_ruta_view, 
    dashboard_metrics_view, 
    importar_rayen_view
)

router = DefaultRouter()
router.register(r'pacientes', PacienteViewSet)
router.register(r'vehiculos', VehiculoViewSet)
router.register(r'rutas', RutaViewSet)
router.register(r'visitas', VisitaViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('optimizar-ruta/', calcular_ruta_view, name='optimizar-ruta'),
    path('dashboard-metrics/', dashboard_metrics_view, name='dashboard-metrics'),
    path('importar-rayen/', importar_rayen_view, name='importar-rayen'),
]