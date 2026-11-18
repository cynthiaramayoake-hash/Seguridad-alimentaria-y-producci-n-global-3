// Paleta definida en la Fase 2. Es la única fuente de los colores:
// main.jsx la convierte en variables CSS (--verde, --turquesa, ...)
// y las gráficas de Recharts/Leaflet la importan directamente.
export const PALETA = {
  verde: '#1F4E3D',      // estructura: encabezado, KPI principal
  turquesa: '#0A93A0',   // serie principal, suficiencia calórica
  ambar: '#C27A06',      // alerta, serie resaltada, déficit calórico
  gris: '#C9C5BB',       // series de contexto, cuadrícula
  carbon: '#1D2433',     // todo el texto
  fondo: '#FAF8F3',      // fondo de la página
  tarjeta: '#FFFFFF',
  borde: '#E6E2D8',
  texto2: '#5A6170',     // texto secundario
  turquesaClaro: '#7CC3CB',     // mapa (suficiencia moderada) y flujo hacia "Alimento"
  turquesaMuyClaro: '#CDE8EB',  // escala de producción del mapa
  ambarClaro: '#E3B77A',        // mapa: déficit moderado
  grisClaro: '#E4E1DA',         // flujos del Sankey y punto medio del mapa
}

// Escala divergente del mapa (kcal por persona al día): ámbar (déficit) → gris (umbral 2,500) → turquesa (suficiencia).
// El corte de 2,500 kcal es el umbral de riesgo; son los mismos cortes y colores del mockup de la Fase 2.
export const ESCALA_MAPA = [
  { hasta: 2100, color: '#C27A06', etiqueta: '< 2,100' },
  { hasta: 2500, color: '#E3B77A', etiqueta: '2,100–2,499' },
  { hasta: 2800, color: '#E4E1DA', etiqueta: '2,500–2,799' },
  { hasta: 3200, color: '#7CC3CB', etiqueta: '2,800–3,199' },
  { hasta: Infinity, color: '#0A93A0', etiqueta: '≥ 3,200' },
]
// Escala secuencial turquesa del modo "Producción" (de poca a mucha producción)
export const ESCALA_PRODUCCION = ['#CDE8EB', '#7CC3CB', '#3FA9B3', '#0A93A0', '#075F68']
export const SIN_DATO = 'url(#sindato)' // trama rayada definida en el mapa (PatronSinDato)
