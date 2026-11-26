import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'package:url_launcher/url_launcher.dart';

/// Cambia esta URL por la de tu túnel cloudflared cuando pruebes en vivo
const String apiBaseUrl = String.fromEnvironment(
  'API_BASE_URL',
  defaultValue: 'http://10.0.2.2:8000/api',
);

void main() {
  runApp(const PortezueloMovilApp());
}

class PortezueloMovilApp extends StatelessWidget {
  const PortezueloMovilApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'CESFAM Portezuelo · Móvil',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        colorSchemeSeed: const Color(0xFF0F766E),
        scaffoldBackgroundColor: const Color(0xFFF8FAFC),
      ),
      home: const LoginScreen(),
    );
  }
}

class PerfilUsuario {
  final String usuario;
  final String nombre;
  final String rol;
  final String filtroAsignado;

  const PerfilUsuario({
    required this.usuario,
    required this.nombre,
    required this.rol,
    required this.filtroAsignado,
  });
}

const List<PerfilUsuario> cuentasDemo = [
  PerfilUsuario(
    usuario: 'coord.portezuelo',
    nombre: 'Coordinación CESFAM Portezuelo',
    rol: 'Coordinador',
    filtroAsignado: 'Todos',
  ),
  PerfilUsuario(
    usuario: 'carla.soto',
    nombre: 'Enf. Carla Soto',
    rol: 'Trabajador Terreno',
    filtroAsignado: 'Enf. Carla Soto',
  ),
  PerfilUsuario(
    usuario: 'diego.rojas',
    nombre: 'TENS Diego Rojas',
    rol: 'Trabajador Terreno',
    filtroAsignado: 'TENS Diego Rojas',
  ),
  PerfilUsuario(
    usuario: 'ana.vidal',
    nombre: 'Kine. Ana Vidal',
    rol: 'Trabajador Terreno',
    filtroAsignado: 'Kine. Ana Vidal',
  ),
  PerfilUsuario(
    usuario: 'marcos.ruiz',
    nombre: 'Chofer Marcos Ruiz',
    rol: 'Chofer',
    filtroAsignado: 'Enf. Carla Soto',
  ),
];

class VisitaDomiciliaria {
  final String id;
  final String hora;
  final String paciente;
  final String telefono;
  final String sector;
  final String equipo;
  final String referencia;
  final String reqClinico;
  final double lat;
  final double lng;
  String estado;
  String confirmacion;

  VisitaDomiciliaria({
    required this.id,
    required this.hora,
    required this.paciente,
    required this.telefono,
    required this.sector,
    required this.equipo,
    required this.referencia,
    required this.reqClinico,
    required this.lat,
    required this.lng,
    required this.estado,
    required this.confirmacion,
  });
}

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _userCtrl = TextEditingController(text: 'carla.soto');
  final _passCtrl = TextEditingController(text: '123');
  String _error = '';

  void _ingresar() {
    final user = _userCtrl.text.trim().toLowerCase();
    final pass = _passCtrl.text;

    final perfil = cuentasDemo.where((c) => c.usuario == user).firstOrNull;
    if (perfil == null || pass != '123') {
      setState(() {
        _error = 'Credenciales inválidas (clave demo: 123).';
      });
      return;
    }

    Navigator.of(context).pushReplacement(
      MaterialPageRoute(builder: (_) => RutaTerrenoScreen(perfil: perfil)),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24),
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 420),
              child: Card(
                elevation: 0,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(16),
                  side: const BorderSide(color: Color(0xFFE2E8F0)),
                ),
                child: Padding(
                  padding: const EdgeInsets.all(24),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      const Icon(Icons.route, size: 40, color: Color(0xFF0F766E)),
                      const SizedBox(height: 12),
                      const Text(
                        'CESFAM Portezuelo',
                        textAlign: TextAlign.center,
                        style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 4),
                      const Text(
                        'Aplicación Móvil · Atención Domiciliaria',
                        textAlign: TextAlign.center,
                        style: TextStyle(color: Colors.black54, fontSize: 13),
                      ),
                      const SizedBox(height: 24),
                      TextField(
                        controller: _userCtrl,
                        decoration: const InputDecoration(
                          labelText: 'Usuario institucional',
                          border: OutlineInputBorder(),
                        ),
                      ),
                      const SizedBox(height: 12),
                      TextField(
                        controller: _passCtrl,
                        obscureText: true,
                        decoration: const InputDecoration(
                          labelText: 'Contraseña',
                          border: OutlineInputBorder(),
                        ),
                      ),
                      if (_error.isNotEmpty) ...[
                        const SizedBox(height: 12),
                        Text(_error, style: const TextStyle(color: Colors.red)),
                      ],
                      const SizedBox(height: 20),
                      FilledButton.icon(
                        onPressed: _ingresar,
                        icon: const Icon(Icons.login),
                        label: const Text('Ingresar'),
                      ),
                      const SizedBox(height: 16),
                      const Text(
                        'Usuarios: coord.portezuelo, carla.soto, diego.rojas, ana.vidal, marcos.ruiz (clave: 123)',
                        style: TextStyle(fontSize: 11, color: Colors.black54),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class RutaTerrenoScreen extends StatefulWidget {
  final PerfilUsuario perfil;
  const RutaTerrenoScreen({super.key, required this.perfil});

  @override
  State<RutaTerrenoScreen> createState() => _RutaTerrenoScreenState();
}

class _RutaTerrenoScreenState extends State<RutaTerrenoScreen> {
  final List<VisitaDomiciliaria> _visitas = [
    VisitaDomiciliaria(
      id: 'v-1',
      hora: '08:00',
      paciente: 'Rosa Henríquez',
      telefono: '56981234567',
      sector: 'Portezuelo Urbano',
      equipo: 'Enf. Carla Soto',
      referencia: 'Pasaje cercano a plaza, casa reja blanca',
      reqClinico: 'Curación avanzada y control signos vitales',
      lat: -36.533,
      lng: -72.438,
      estado: 'Pendiente',
      confirmacion: 'Confirmada',
    ),
    VisitaDomiciliaria(
      id: 'v-2',
      hora: '08:30',
      paciente: 'Héctor Muñoz',
      telefono: '56982345678',
      sector: 'Buenos Aires',
      equipo: 'Enf. Carla Soto',
      referencia: 'Sector Buenos Aires km 3, casa madera junto a nogal',
      reqClinico: 'Administración tratamiento endovenoso',
      lat: -36.542,
      lng: -72.419,
      estado: 'En ruta',
      confirmacion: 'Pendiente aviso',
    ),
    VisitaDomiciliaria(
      id: 'v-3',
      hora: '09:15',
      paciente: 'Luis Cartes',
      telefono: '56983456789',
      sector: 'Cucha Cucha',
      equipo: 'TENS Diego Rojas',
      referencia: 'Camino rural Cucha Cucha, portón verde tras curva',
      reqClinico: 'Control presión arterial y apoyo movilización',
      lat: -36.551,
      lng: -72.462,
      estado: 'Pendiente',
      confirmacion: 'Confirmada',
    ),
    VisitaDomiciliaria(
      id: 'v-4',
      hora: '10:00',
      paciente: 'Ernestina Sáez',
      telefono: '56985678901',
      sector: 'Llahuecuy',
      equipo: 'Kine. Ana Vidal',
      referencia: 'Sector Llahuecuy, segunda casa después del puente',
      reqClinico: 'Rehabilitación respiratoria y motora',
      lat: -36.518,
      lng: -72.475,
      estado: 'Completada',
      confirmacion: 'Confirmada',
    ),
  ];

  int _pendientesSync = 0;

  @override
  void initState() {
    super.initState();
    _cargarEstadosLocales();
    _sincronizarDesdeBackend();
  }

  Future<void> _cargarEstadosLocales() async {
    final prefs = await SharedPreferences.getInstance();
    final cola = prefs.getStringList('cola_offline_visitas') ?? [];
    setState(() {
      _pendientesSync = cola.length;
      for (final v in _visitas) {
        final saved = prefs.getString('estado_${v.id}');
        if (saved != null) v.estado = saved;
      }
    });
  }

  Future<void> _sincronizarDesdeBackend() async {
    try {
      final res = await http
          .get(Uri.parse('$apiBaseUrl/ruta-optimizada/'))
          .timeout(const Duration(seconds: 4));
      if (res.statusCode == 200 && mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Conectado con backend CESFAM Portezuelo')),
        );
      }
    } catch (_) {
      // Mantiene datos locales en modo rural sin señal
    }
  }

  Future<void> _cambiarEstado(VisitaDomiciliaria visita, String nuevoEstado) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('estado_${visita.id}', nuevoEstado);

    setState(() {
      visita.estado = nuevoEstado;
    });

    final payload = jsonEncode({
      'visita_id': visita.id,
      'estado': nuevoEstado,
      'timestamp': DateTime.now().toIso8601String(),
    });

    try {
      final res = await http
          .post(
            Uri.parse('$apiBaseUrl/visitas/${visita.id}/estado/'),
            headers: {'Content-Type': 'application/json'},
            body: payload,
          )
          .timeout(const Duration(seconds: 4));

      if (res.statusCode < 200 || res.statusCode >= 300) {
        throw Exception('Error servidor');
      }
    } catch (_) {
      final cola = prefs.getStringList('cola_offline_visitas') ?? [];
      cola.add(payload);
      await prefs.setStringList('cola_offline_visitas', cola);
      setState(() {
        _pendientesSync = cola.length;
      });
    }
  }

  Future<void> _abrirWhatsApp(VisitaDomiciliaria v) async {
    final msg = Uri.encodeComponent(
      'Hola ${v.paciente}, le escribimos de CESFAM Portezuelo. Hoy tenemos visita domiciliaria cerca de las ${v.hora} hrs en ${v.sector}. ¿Confirma que estará en domicilio?',
    );
    final uri = Uri.parse('https://wa.me/${v.telefono}?text=$msg');
    await launchUrl(uri, mode: LaunchMode.externalApplication);
  }

  Future<void> _abrirMaps(VisitaDomiciliaria v) async {
    final uri = Uri.parse(
      'https://www.google.com/maps/search/?api=1&query=${v.lat},${v.lng}',
    );
    await launchUrl(uri, mode: LaunchMode.externalApplication);
  }

  @override
  Widget build(BuildContext context) {
    final filtradas = widget.perfil.filtroAsignado == 'Todos'
        ? _visitas
        : _visitas
            .where((v) => v.equipo == widget.perfil.filtroAsignado)
            .toList();

    return Scaffold(
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(widget.perfil.nombre, style: const TextStyle(fontSize: 16)),
            Text(
              '${widget.perfil.rol} · $_pendientesSync pendientes sync',
              style: const TextStyle(fontSize: 12, color: Colors.black54),
            ),
          ],
        ),
        actions: [
          IconButton(
            tooltip: 'Cerrar sesión',
            icon: const Icon(Icons.logout),
            onPressed: () {
              Navigator.of(context).pushReplacement(
                MaterialPageRoute(builder: (_) => const LoginScreen()),
              );
            },
          ),
        ],
      ),
      body: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: filtradas.length,
        itemBuilder: (context, index) {
          final v = filtradas[index];
          return Card(
            margin: const EdgeInsets.only(bottom: 12),
            elevation: 0,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(14),
              side: const BorderSide(color: Color(0xFFE2E8F0)),
            ),
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'Parada #${index + 1} · ${v.hora} hrs · ${v.sector}',
                        style: const TextStyle(
                          fontSize: 12,
                          color: Colors.black54,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      Chip(
                        label: Text(v.estado, style: const TextStyle(fontSize: 11)),
                        visualDensity: VisualDensity.compact,
                      ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Text(
                    v.paciente,
                    style: const TextStyle(fontSize: 17, fontWeight: FontWeight.bold),
                  ),
                  Text(
                    v.reqClinico,
                    style: const TextStyle(fontSize: 13, color: Colors.black87),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Referencia rural: ${v.referencia}',
                    style: const TextStyle(fontSize: 12, color: Colors.black54),
                  ),
                  const SizedBox(height: 12),
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: [
                      for (final est in ['En ruta', 'En visita', 'Completada'])
                        ChoiceChip(
                          label: Text(est),
                          selected: v.estado == est,
                          onSelected: (_) => _cambiarEstado(v, est),
                        ),
                      OutlinedButton.icon(
                        onPressed: () => _abrirWhatsApp(v),
                        icon: const Icon(Icons.chat, size: 16),
                        label: const Text('Avisar'),
                      ),
                      OutlinedButton.icon(
                        onPressed: () => _abrirMaps(v),
                        icon: const Icon(Icons.navigation, size: 16),
                        label: const Text('GPS'),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}