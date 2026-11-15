import math
from ortools.constraint_solver import routing_enums_pb2
from ortools.constraint_solver import pywrapcp
from pacientes.models import Paciente  # Importamos tu modelo de pacientes

def calcular_distancia_haversine(lat1, lon1, lat2, lon2):
    """Calcula la distancia real en metros entre dos puntos geográficos (Haversine)."""
    R = 6371000  # Radio de la tierra en metros
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = math.sin(delta_phi / 2.0) ** 2 + \
        math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2.0) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

    return int(R * c)

def optimizar_ruta_pacientes():
    # 1. Obtenemos los pacientes reales desde la base de datos
    pacientes = list(Paciente.objects.all())
    
    # Si hay menos de 2 pacientes, agregamos un punto de base inicial (ej. CESFAM Chillán)
    # Coordenadas de referencia aproximadas en Chillán: -36.6067, -72.1030
    ubicaciones = [{"nombre": "Base CESFAM", "lat": -36.6067, "lon": -72.1030}]
    
    for p in pacientes:
        ubicaciones.append({
            "nombre": p.nombre,
            "lat": float(p.latitud),
            "lon": float(p.longitud)
        })

    num_ubicaciones = len(ubicaciones)
    if num_ubicaciones <= 1:
        return {"error": "Se necesitan al menos un paciente registrado con coordenadas para optimizar."}

    # 2. Construimos la matriz de distancias dinámica usando las coordenadas reales
    distance_matrix = [[0] * num_ubicaciones for _ in range(num_ubicaciones)]
    for i in range(num_ubicaciones):
        for j in range(num_ubicaciones):
            if i != j:
                distance_matrix[i][j] = calcular_distancia_haversine(
                    ubicaciones[i]["lat"], ubicaciones[i]["lon"],
                    ubicaciones[j]["lat"], ubicaciones[j]["lon"]
                )

    data = {
        'distance_matrix': distance_matrix,
        'num_vehicles': 1,
        'depot': 0  # La base de salida
    }

    # 3. Configuramos el motor OR-Tools
    manager = pywrapcp.RoutingIndexManager(len(data['distance_matrix']), data['num_vehicles'], data['depot'])
    routing = pywrapcp.RoutingModel(manager)

    def distance_callback(from_index, to_index):
        from_node = manager.IndexToNode(from_index)
        to_node = manager.IndexToNode(to_index)
        return data['distance_matrix'][from_node][to_node]

    transit_callback_index = routing.RegisterTransitCallback(distance_callback)
    routing.SetArcCostEvaluatorOfAllVehicles(transit_callback_index)

    search_parameters = pywrapcp.DefaultRoutingSearchParameters()
    search_parameters.first_solution_strategy = routing_enums_pb2.FirstSolutionStrategy.PATH_CHEAPEST_ARC

    solution = routing.SolveWithParameters(search_parameters)

    if solution:
        index = routing.Start(0)
        plan_ruta = []
        nombres_ordenados = []
        distancia_total = 0
        
        while not routing.IsEnd(index):
            nodo_actual = manager.IndexToNode(index)
            plan_ruta.append(nodo_actual)
            nombres_ordenados.append(ubicaciones[nodo_actual]["nombre"])
            previous_index = index
            index = solution.Value(routing.NextVar(index))
            distancia_total += routing.GetArcCostForVehicle(previous_index, index, 0)
        
        nombres_ordenados.append(ubicaciones[manager.IndexToNode(index)]["nombre"])
        
        return {
            "secuencia_nombres": nombres_ordenados,
            "ruta_optima": plan_ruta,
            "distancia_total_metros": distancia_total
        }
    return None