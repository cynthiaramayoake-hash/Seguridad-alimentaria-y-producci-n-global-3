import { useMemo, useState } from 'react'
import Encabezado from './components/layout/Encabezado'
import KpiPrincipal from './components/kpis/KpiPrincipal'
import KpiTarjeta from './components/kpis/KpiTarjeta'
import MapaPaises from './components/map/MapaPaises'
import BarrasContinente from './components/charts/BarrasContinente'
import LineaEvolucion from './components/charts/LineaEvolucion'
import TopPaises from './components/charts/TopPaises'
import SankeyDestino from './components/charts/SankeyDestino'
import Notas from './components/common/Notas'
import { useDashboardData } from './hooks/useDashboardData'
import { GRUPOS } from './services/dataService'
import * as K from './utils/kpis'
import { PALETA } from './styles/palette'
import styles from './App.module.css'

const ANIOS = [2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015]
const CONTINENTES = ['Todos', 'África', 'América', 'Asia', 'Europa', 'Oceanía']

export default function App() {
  const [filtros, setFiltros] = useState({ anio: 2023, continente: 'Todos', grupo: 'Cereales' })
  const [modoTop, setModoTop] = useState('productores')
  const d = useDashboardData(filtros.anio)
  const { anio, continente, grupo } = filtros
  const anioB = d.anioBalance // año usado para datos del balance (máximo 2023)

  // Todos los KPIs se recalculan solo cuando cambian los datos o los filtros
  const k = useMemo(() => {
    if (d.cargando) return null
    const isos = K.paisesFiltrados(d.paises, continente)
    return {
      isos,
      atipicos: d.produccion.filter((f) => Number(f.variacion_atipica) === 1).length,
      nombres: Object.fromEntries(d.paises.map((p) => [p.iso3, p.pais])),
      principal: K.kpiPrincipal(d.kcal, anioB, isos),
      riesgo: K.paisesEnRiesgo(d.kcal, anioB, isos),
      kcalPais: K.kcalPorPais(d.kcal, anioB),
      dependencia: K.dependenciaPorPais(d.balance, grupo),
      produccionPais: K.produccionPorPais(d.produccion, { grupo, anio }),
      prodTotal: K.produccionTotal(d.produccion, { isos, grupo, anio }),
      prodCambio: K.cambioProduccion(d.produccion, { isos, grupo, anio }),
      continentes: K.produccionPorContinente(d.produccion, d.paises, { grupo, anio }),
      evolucion: K.evolucionPorGrupo(d.produccion, isos, GRUPOS),
      top: K.topPaises({ prod: d.produccion, balance: d.balance, paises: d.paises, isos, grupo,
        anio: modoTop === 'productores' ? anio : anioB, modo: modoTop }),
      flujo: K.flujoDestino(d.balance, { isos, grupo }),
    }
  }, [d.cargando, d.paises, d.kcal, d.produccion, d.balance, anio, anioB, continente, grupo, modoTop])

  if (d.error) return <p className={styles.mensaje}>No se pudieron cargar los datos: {String(d.error.message || d.error)}</p>
  if (!k) return <p className={styles.mensaje}>Cargando datos de FAOSTAT…</p>

  const asia = k.continentes.find((c) => c.continente === 'Asia')
  const notaProd = continente === 'Todos'
    ? `Asia aporta ${K.formato(asia?.pct)}% del total`
    : `${K.formato(k.continentes.find((c) => c.continente === continente)?.pct)}% de la producción mundial`
  const cambioProd = k.prodCambio == null ? 'año base' : `${k.prodCambio >= 0 ? '▲ +' : '▼ '}${K.formato(Math.abs(k.prodCambio), 1)}% vs 2015`
  const queProduccion = grupo === 'Todos' ? 'alimentos (7 grupos)' : grupo.toLowerCase()
  const aviso = anio > anioB ? ` (último año con balance)` : ''
  const verMapa = () => document.getElementById('mapa')?.scrollIntoView({ behavior: 'smooth', block: 'center' })

  return (
    <main className={styles.tablero}>
      {/* Fila 1 */}
      <Encabezado filtros={filtros} setFiltros={setFiltros}
        opciones={{ anios: ANIOS, continentes: CONTINENTES, grupos: ['Todos', ...GRUPOS] }} />

      {/* Fila 2: panel de KPIs */}
      <KpiPrincipal datos={k.principal} anio={anioB} continente={continente} aviso={aviso} />
      <KpiTarjeta titulo="Países en riesgo" subtitulo={`${aviso ? 'Menor a' : 'Disponibilidad menor a'} 2,500 kcal por persona al día, ${anioB}${aviso}`}
        valor={k.riesgo.enRiesgo} unidad={`de ${k.riesgo.total} países`} color={PALETA.ambar}
        nota={<>{K.formato((k.riesgo.enRiesgo / Math.max(k.riesgo.total, 1)) * 100)}% de los países con balance alimentario · <button type="button" className={styles.enlace} onClick={verMapa}>ver mapa</button></>} />
      <KpiTarjeta titulo={continente === 'Todos' ? `Producción mundial de ${queProduccion}` : `Producción de ${queProduccion} en ${continente}`}
        subtitulo={`Millones de toneladas, ${anio} · cambia con el filtro de grupo`}
        valor={K.formato(k.prodTotal)} unidad="millones de t" color={PALETA.turquesa} nota={`${cambioProd} · ${notaProd}`} marca="" />

      {/* Fila 3 */}
      <MapaPaises kcalPais={k.kcalPais} isos={k.isos} anio={anioB} anioProduccion={anio} nombres={k.nombres} continente={continente}
        grupo={grupo} dependencia={k.dependencia} produccionPais={k.produccionPais} />
      <BarrasContinente datos={k.continentes} anio={anio} grupo={grupo} continente={continente} />

      {/* Fila 4 */}
      <LineaEvolucion datos={k.evolucion} grupos={GRUPOS} resaltado={grupo === 'Todos' ? 'Cereales' : grupo} continente={continente} />
      <TopPaises datos={k.top} modo={modoTop} setModo={setModoTop}
        anio={modoTop === 'productores' ? anio : anioB} grupo={grupo} />

      {/* Fila 5 */}
      <SankeyDestino datos={k.flujo} anio={anioB} grupo={grupo} continente={continente} />
      <Notas fuente={d.fuente} anio={anio} anioBalance={anioB} atipicos={k.atipicos} />
    </main>
  )
}
