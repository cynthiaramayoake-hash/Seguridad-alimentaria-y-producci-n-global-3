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
}

// Escala divergente del mapa: ámbar (déficit) → gris (umbral 2,500) → turquesa (suficiencia)
export const ESCALA_MAPA = [
  { hasta: 2150, color: '#A45F00' },
  { hasta: 2500, color: '#E3B565' },
  { hasta: 2800, color: '#D8D2C4' },
  { hasta: 3200, color: '#7CC3C9' },
  { hasta: Infinity, color: '#0A7E8A' },
]
export const SIN_DATO = '#F4F3F0'
