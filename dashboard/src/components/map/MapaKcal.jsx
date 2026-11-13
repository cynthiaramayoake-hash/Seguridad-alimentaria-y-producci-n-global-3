import { useEffect } from 'react'
import { MapContainer, GeoJSON, useMap } from 'react-leaflet'
import L from 'leaflet'
import Tarjeta from '../common/Tarjeta'
import geo from '../../data/paises.geo.json'
import { ESCALA_MAPA, SIN_DATO } from '../../styles/palette'
import { formato, UMBRAL_KCAL } from '../../utils/kpis'
import styles from './MapaKcal.module.css'

// Encuadre del mapa según el filtro de continente
const ENCUADRE = {
  Todos: [[-56, -168], [78, 190]], África: [[-36, -20], [38, 52]], América: [[-56, -130], [72, -32]],
  Asia: [[-12, 25], [62, 150]], Europa: [[34, -25], [71, 45]], Oceanía: [[-48, 110], [0, 180]],
}
function Encuadrar({ continente }) {
  const mapa = useMap()
  useEffect(() => { mapa.flyToBounds(ENCUADRE[continente] || ENCUADRE.Todos, { duration: 0.6 }) }, [continente, mapa])
  return null
}

const colorKcal = (v) => (v == null ? SIN_DATO : ESCALA_MAPA.find((e) => v < e.hasta).color)

// Mapa coroplético del KPI principal (nivel 1). Sin mapa base: solo los países, para no distraer.
export default function MapaKcal({ kcalPais, isos, anio, nombres, continente }) {
  const estilo = (f) => {
    const iso = f.properties.iso3
    const dentro = isos.has(iso)
    return {
      fillColor: colorKcal(kcalPais[iso]),
      fillOpacity: dentro ? 1 : 0.25, // países fuera del continente elegido quedan tenues
      color: kcalPais[iso] == null ? '#C9C5BB' : '#fff', weight: 0.6,
    }
  }
  const alPasar = (f, capa) => {
    const iso = f.properties.iso3
    const v = kcalPais[iso]
    capa.bindTooltip(
      `<b>${nombres[iso] || f.properties.nombre}</b><br>${v == null ? 'Sin dato' : formato(v) + ' kcal/persona/día'}` +
      (v != null && v < UMBRAL_KCAL ? '<br><span style="color:#A45F00">⚠ bajo el umbral de 2,500</span>' : ''),
      { sticky: true },
    )
    capa.on({ mouseover: () => capa.setStyle({ weight: 2, color: '#1D2433' }), mouseout: () => capa.setStyle({ weight: 0.6, color: kcalPais[iso] == null ? '#C9C5BB' : '#fff' }) })
  }

  return (
    <Tarjeta nivel={1} className={styles.area} titulo={`Disponibilidad calórica por país, ${anio}`}
      subtitulo="kcal por persona al día · umbral de riesgo: 2,500 kcal">
      {/* Proyección equirectangular (EPSG:4326): aprovecha mejor el ancho de la tarjeta que Mercator */}
      <MapContainer className={styles.mapa} crs={L.CRS.EPSG4326} bounds={[[-56, -168], [78, 190]]} zoomSnap={0.1}
        maxBounds={[[-80, -200], [88, 220]]} scrollWheelZoom={false} attributionControl={false}>
        <GeoJSON key={`${anio}-${continente}`} data={geo} style={estilo} onEachFeature={alPasar} />
        <Encuadrar continente={continente} />
      </MapContainer>
      <Leyenda />
    </Tarjeta>
  )
}

function Leyenda() {
  const cortes = ['<2,150', '2,150–2,500', '2,500–2,800', '2,800–3,200', '>3,200']
  return (
    <div className={styles.leyenda}>
      {ESCALA_MAPA.map((e, i) => (
        <span key={i}><i style={{ background: e.color }} />{cortes[i]}</span>
      ))}
      <span><i style={{ background: SIN_DATO, border: '1px solid #ccc' }} />Sin dato</span>
    </div>
  )
}
