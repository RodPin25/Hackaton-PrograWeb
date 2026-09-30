// Datos de ejemplo para probar el tracker SIN backend ni login.
// Solo se usan cuando VITE_DEMO=true (npm run demo).
// Las fechas son relativas al momento de abrir la demo, asi "Actualizado hace X min"
// y "Senal activa / Sin senal" se comportan igual que con datos reales.

const T0 = Date.now()
const hace = (min) => new Date(T0 - min * 60000).toISOString()
const dentro = (min) => new Date(T0 + min * 60000).toISOString()
const DIA = 1440

// Origen (Ciudad de Guatemala) y destino (Hospital Regional de Occidente, Xela)
const ORIGEN = { lat: 14.634915, lng: -90.506882 }
const DESTINO = { lat: 14.8447, lng: -91.5158 }
const enRuta = (t) => ({
  lat: +(ORIGEN.lat + (DESTINO.lat - ORIGEN.lat) * t).toFixed(6),
  lng: +(ORIGEN.lng + (DESTINO.lng - ORIGEN.lng) * t).toFixed(6)
})

const base = {
  destino_nombre: 'Hospital Regional de Occidente',
  destino_latitud: DESTINO.lat,
  destino_longitud: DESTINO.lng,
  repartidor_nombre: 'Luis Repartidor',
  proveedor_nombre: 'Farmacorp'
}

const paso = (id, estado, min, t, notas, temperatura = null) => ({
  id,
  estado,
  notas,
  temperatura,
  latitud: enRuta(t).lat,
  longitud: enRuta(t).lng,
  fecha_actualizacion: hace(min),
  usuario_nombre: 'Luis Repartidor'
})

// Cada escenario = un pedido + su historial de tracking
const ESCENARIOS = [
  {
    etiqueta: 'En tránsito',
    pedido: {
      id: 1, codigo: 'PED-2026-DEMO01', estado_actual: 'EN_CAMINO',
      ...base,
      items: [{ producto_nombre: 'Insulina glargina', cantidad: 120 }],
      fecha_entrega_estimada: dentro(DIA),
      temperatura: 4.2, ultima_latitud: enRuta(0.55).lat, ultima_longitud: enRuta(0.55).lng,
      ultima_actualizacion: hace(4)
    },
    historial: [
      paso(1, 'CREADO', 2 * DIA, 0, 'Pedido registrado en sistema'),
      paso(2, 'ASIGNADO', DIA, 0, 'Pedido preparado y asignado a repartidor', 4.0),
      paso(3, 'EN_CAMINO', 4, 0.55, 'Pasando por Los Encuentros, Sololá', 4.2)
    ]
  },
  {
    etiqueta: 'Recién registrado',
    pedido: {
      id: 2, codigo: 'PED-2026-DEMO02', estado_actual: 'CREADO',
      ...base, repartidor_nombre: null,
      items: [{ producto_nombre: 'Vacuna antiinfluenza', cantidad: 500 }],
      fecha_entrega_estimada: dentro(3 * DIA),
      temperatura: null, ultima_latitud: ORIGEN.lat, ultima_longitud: ORIGEN.lng,
      ultima_actualizacion: hace(12)
    },
    historial: [paso(1, 'CREADO', 12, 0, 'Pedido registrado en sistema')]
  },
  {
    etiqueta: 'Por llegar',
    pedido: {
      id: 3, codigo: 'PED-2026-DEMO03', estado_actual: 'EN_ENTREGA',
      ...base,
      items: [
        { producto_nombre: 'Heparina sódica', cantidad: 80 },
        { producto_nombre: 'Jeringas 5 ml', cantidad: 400 }
      ],
      fecha_entrega_estimada: dentro(35),
      temperatura: 5.1, ultima_latitud: enRuta(0.96).lat, ultima_longitud: enRuta(0.96).lng,
      ultima_actualizacion: hace(2)
    },
    historial: [
      paso(1, 'CREADO', 2 * DIA, 0, 'Pedido registrado en sistema'),
      paso(2, 'ASIGNADO', DIA + 300, 0, 'Pedido preparado y asignado a repartidor', 4.5),
      paso(3, 'EN_CAMINO', 300, 0.3, 'Salida de bodega central', 4.6),
      paso(4, 'EN_ENTREGA', 2, 0.96, 'A pocos minutos del hospital', 5.1)
    ]
  },
  {
    etiqueta: 'Entregado',
    pedido: {
      id: 4, codigo: 'PED-2026-DEMO04', estado_actual: 'ENTREGADO',
      ...base,
      items: [{ producto_nombre: 'Amoxicilina 500 mg', cantidad: 2000 }],
      fecha_entrega_estimada: hace(90),
      temperatura: 6.3, ultima_latitud: DESTINO.lat, ultima_longitud: DESTINO.lng,
      ultima_actualizacion: hace(75)
    },
    historial: [
      paso(1, 'CREADO', 4 * DIA, 0, 'Pedido registrado en sistema'),
      paso(2, 'ASIGNADO', 3 * DIA, 0, 'Pedido preparado y asignado a repartidor', 5.0),
      paso(3, 'EN_CAMINO', 2 * DIA, 0.4, 'En ruta', 5.5),
      paso(4, 'EN_ENTREGA', 100, 0.98, 'Llegando al hospital', 6.0),
      paso(5, 'ENTREGADO', 75, 1, 'Recibido por bodega del hospital', 6.3)
    ]
  },
  {
    etiqueta: 'Cancelado',
    pedido: {
      id: 5, codigo: 'PED-2026-DEMO05', estado_actual: 'CANCELADO',
      ...base,
      items: [{ producto_nombre: 'Factor VIII', cantidad: 30 }],
      fecha_entrega_estimada: null,
      temperatura: null, ultima_latitud: ORIGEN.lat, ultima_longitud: ORIGEN.lng,
      ultima_actualizacion: hace(600)
    },
    historial: [
      paso(1, 'CREADO', DIA, 0, 'Pedido registrado en sistema'),
      paso(2, 'ASIGNADO', 700, 0, 'Pedido preparado y asignado a repartidor', 4.1),
      paso(3, 'CANCELADO', 600, 0, 'Cancelado por el proveedor')
    ]
  },
  {
    etiqueta: 'Sin señal',
    pedido: {
      id: 6, codigo: 'PED-2026-DEMO06', estado_actual: 'EN_CAMINO',
      ...base,
      items: [{ producto_nombre: 'Paracetamol IV', cantidad: 250 }],
      fecha_entrega_estimada: dentro(240),
      temperatura: 7.8, ultima_latitud: enRuta(0.35).lat, ultima_longitud: enRuta(0.35).lng,
      ultima_actualizacion: hace(180)
    },
    historial: [
      paso(1, 'CREADO', DIA, 0, 'Pedido registrado en sistema'),
      paso(2, 'ASIGNADO', 400, 0, 'Pedido preparado y asignado a repartidor', 4.0),
      paso(3, 'EN_CAMINO', 180, 0.35, 'Último reporte antes de perder cobertura', 7.8)
    ]
  },
  {
    etiqueta: 'Sin datos',
    pedido: {
      id: 7, codigo: 'PED-2026-DEMO07', estado_actual: 'ASIGNADO',
      ...base, repartidor_nombre: null, proveedor_nombre: null,
      items: [{ producto_nombre: 'Suero fisiológico', cantidad: 300 }],
      fecha_entrega_estimada: null,
      temperatura: null, ultima_latitud: ORIGEN.lat, ultima_longitud: ORIGEN.lng,
      ultima_actualizacion: hace(20)
    },
    historial: [
      paso(1, 'CREADO', 60, 0, 'Pedido registrado en sistema'),
      paso(2, 'ASIGNADO', 20, 0, '', null)
    ]
  }
]

export const ESCENARIOS_DEMO = ESCENARIOS.map((e) => ({ id: e.pedido.id, etiqueta: e.etiqueta }))

// Misma forma que responde el backend: { success, data }
export const mockGetPedidos = async () => ({
  success: true,
  data: ESCENARIOS.map((e) => e.pedido)
})

export const mockGetHistorial = async (pedidoId) => ({
  success: true,
  data: ESCENARIOS.find((e) => e.pedido.id === pedidoId)?.historial || []
})
