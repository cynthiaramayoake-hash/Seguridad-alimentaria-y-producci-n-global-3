import { useEffect, useMemo, useRef, useState } from 'react'
import { MapContainer, GeoJSON, ZoomControl, useMap } from 'react-leaflet'
import L from 'leaflet'
import Tarjeta from '../common/Tarjeta'
import Selector from '../common/Selector'
import LeyendaMapa from './LeyendaMapa'
import PatronSinDato from './PatronSinDato'
import { ESCALA_MAPA, ESCALA_PRODUCCION, SIN_DATO } from '../../styles/palette'
import { formato, UMBRAL_KCAL } from '../../utils/kpis'
import { nombreCorto } from '../../utils/nombres'
import styles from './MapaPaises.module.css'

const MODOS = [{ valor: 'kcal', etiqueta: 'kcal por persona' }, { valor: 'produccion', etiqueta: 'Producción' }]

// Geometría de los países (public/paises.geojson, ya proyectada en Natural Earth; la genera data/preparar_mapa.mjs).
// Se descarga una sola vez y se comparte entre renders.
let promesaGeo = null
const cargarGeo = () => (promesaGeo ??= fetch(`${import.meta.env.BASE_URL}paises.geojson`).then((r) => {
  if (!r.ok) throw new Error(`paises.geojson: ${r.status}`)
  return r.json()
}))

// Encuadre según el filtro de continente. Con L.CRS.Simple el mapa vive en un plano x/y (no en grados),
// por eso los encuadres vienen calculados dentro del propio archivo.
function Encuadrar({ continente, encuadres }) {
  const mapa = useMap()
  const primera = useRef(true)
  const actual = useRef(continente)
  const caja = (c) => L.latLngBounds(encuadres[c] || encuadres.Todos)

  // Al cambiar el filtro de continente el mapa se acerca con una transición corta (la primera vez, sin animar)
  useEffect(() => {
    actual.current = continente
    mapa.invalidateSize()
    if (primera.current) mapa.fitBounds(caja(continente), { animate: false })
    else mapa.flyToBounds(caja(continente), { duration: 0.5 })
    primera.current = false
  }, [continente]) // eslint-disable-line react-hooks/exhaustive-deps

  // Si la tarjeta cambia de tamaño se vuelve a encuadrar, y no se puede alejar más que el mundo completo
  useEffect(() => {
    const ajustar = () => {
      mapa.invalidateSize()
      mapa.setMinZoom(-10)
      const minimo = mapa.getBoundsZoom(caja('Todos'), false)
      mapa.setMinZoom(minimo)
      mapa.fitBounds(caja(actual.current), { animate: false })
    }
    const o = new ResizeObserver(ajustar)
    o.observe(mapa.getContainer())
    return () => o.disconnect()
  }, [mapa, encuadres]) // eslint-disable-line react-hooks/exhaustive-deps
  return null
}

const colorPorCorte = (valor, escala) => escala.find((e) => valor < e.hasta).color

// Zona 4 del wireframe (nivel 1): mapa coroplético con dos modos. "kcal por persona" es el KPI principal;
// "Producción" colorea los países según el grupo y el año del filtro.
export default function MapaPaises({ kcalPais, anio, anioProduccion, nombres, isos, continente, grupo, dependencia, produccionPais }) {
  const [modo, setModo] = useState('kcal')
  const [geo, setGeo] = useState(null)
  const [fallo, setFallo] = useState(false)
  useEffect(() => { cargarGeo().then(setGeo).catch(() => setFallo(true)) }, [])

  // Clases del modo elegido: colores, cortes y función que da el color de un país
  const escala = useMemo(() => {
    if (modo === 'kcal') {
      return {
        clases: ESCALA_MAPA.map((e, i) => ({ color: e.color, etiqueta: e.etiqueta, umbral: i === 2 })),
        color: (iso) => (kcalPais[iso] == null ? SIN_DATO : colorPorCorte(kcalPais[iso], ESCALA_MAPA)),
      }
    }
    // Producción: quintiles de los países con dato, con cortes redondeados a 2 cifras significativas para la leyenda
    const valores = Object.values(produccionPais).map((p) => p.mt).filter((v) => v > 0).sort((a, b) => a - b)
    const cortes = [0.2, 0.4, 0.6, 0.8].map((q) => Number((valores[Math.floor(q * valores.length)] ?? 0).toPrecision(2)))
    const f = (v) => (v >= 10 ? Math.round(v).toLocaleString('es-MX') : String(Number(v.toFixed(v >= 1 ? 1 : 2))))
    const etiquetas = [`< ${f(cortes[0])}`, `${f(cortes[0])}–${f(cortes[1])}`, `${f(cortes[1])}–${f(cortes[2])}`, `${f(cortes[2])}–${f(cortes[3])}`, `≥ ${f(cortes[3])}`]
    return {
      clases: ESCALA_PRODUCCION.map((color, i) => ({ color, etiqueta: etiquetas[i] })),
      color: (iso) => {
        const p = produccionPais[iso]
        return p && p.mt > 0 ? ESCALA_PRODUCCION[cortes.filter((c) => p.mt >= c).length] : SIN_DATO
      },
    }
  }, [modo, kcalPais, produccionPais])

  const queGrupo = grupo === 'Todos' ? 'alimentos' : grupo.toLowerCase()
  const textoDe = (iso, nombre) => {
    if (modo === 'kcal') {
      const v = kcalPais[iso]
      if (v == null) return `<b>${nombre}</b><br><span class="nota">Sin dato de balance alimentario</span>`
      const dep = dependencia[iso]
      return `<b>${nombre} · ${formato(v)} kcal</b><br>` +
        (v < UMBRAL_KCAL ? '⚠ bajo el umbral de 2,500' : 'sobre el umbral de 2,500') +
        (dep != null ? `<br><span class="nota">Importa ${dep > 100 ? 'más del 100' : formato(dep)}% de sus ${queGrupo}</span>` : '')
    }
    const p = produccionPais[iso]
    if (!p || !(p.mt > 0)) return `<b>${nombre}</b><br><span class="nota">Sin producción registrada de ${queGrupo}</span>`
    return `<b>${nombre} · ${formato(p.mt, p.mt < 10 ? 1 : 0)} Mt</b><br><span class="nota">${queGrupo[0].toUpperCase() + queGrupo.slice(1)}, ${anioProduccion}</span>` +
      (p.atipica ? '<br>⚠ cambio mayor a 50% vs el año anterior' : '')
  }

  const estilo = (f) => {
    const iso = f.properties.iso3
    return { fillColor: escala.color(iso), fillOpacity: isos.has(iso) ? 1 : 0.25, color: '#fff', weight: 0.6 } // fuera del continente elegido: tenue
  }
  const alCrear = (f, capa) => {
    const iso = f.properties.iso3
    capa.bindTooltip(textoDe(iso, nombreCorto(nombres[iso] || f.properties.nombre)), { sticky: true, className: 'tooltip-pais' })
    capa.on({
      mouseover: () => { capa.setStyle({ weight: 1.8, color: '#1D2433' }); capa.bringToFront() },
      mouseout: () => capa.setStyle({ weight: 0.6, color: '#fff' }),
    })
  }

  return (
    <Tarjeta id="mapa" nivel={1} className={styles.area}
      titulo={modo === 'kcal' ? `Disponibilidad calórica por país, ${anio}` : `Producción de ${queGrupo} por país, ${anioProduccion}`}
      subtitulo={modo === 'kcal' ? 'kcal por persona al día · umbral de riesgo: 2,500 kcal' : 'Millones de toneladas · clases por quintiles de los países con dato'}
      extra={<Selector valor={modo} onCambio={setModo} opciones={MODOS} />}>
      <PatronSinDato />
      <div className={styles.zona}>
        {geo ? (
          <MapContainer className={styles.mapa} crs={L.CRS.Simple} center={[-200, 500]} zoom={0} zoomSnap={0} zoomDelta={0.5}
            bounds={geo.encuadres.Todos} scrollWheelZoom={false} doubleClickZoom={false} attributionControl={false}
            zoomControl={false} style={{ background: 'transparent' }}>
            <ZoomControl position="bottomright" />
            <Encuadrar continente={continente} encuadres={geo.encuadres} />
            <GeoJSON key={`${modo}-${anio}-${anioProduccion}-${grupo}-${continente}`} data={geo} style={estilo} onEachFeature={alCrear} />
          </MapContainer>
        ) : (
          <p style={{ fontSize: 13, color: 'var(--texto2)' }}>{fallo ? 'No se pudo cargar el mapa.' : 'Cargando mapa…'}</p>
        )}
      </div>
      <LeyendaMapa clases={escala.clases} />
    </Tarjeta>
  )
}
