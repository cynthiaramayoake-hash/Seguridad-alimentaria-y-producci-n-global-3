// Cálculo de los KPIs definidos en la Fase 2. Funciones puras: reciben filas y filtros, regresan números.
export const UMBRAL_KCAL = 2500

const mediana = (valores) => {
  if (!valores.length) return null
  const v = [...valores].sort((a, b) => a - b)
  const m = Math.floor(v.length / 2)
  return v.length % 2 ? v[m] : (v[m - 1] + v[m]) / 2
}
const sumar = (filas, campo) => filas.reduce((s, f) => s + Number(f[campo]), 0)

// Países que pasan el filtro de continente (Set de iso3)
export function paisesFiltrados(paises, continente) {
  return new Set(paises.filter((p) => continente === 'Todos' || p.continente === continente).map((p) => p.iso3))
}

// ---- KPI principal: disponibilidad calórica per cápita ----
export function kcalPorPais(kcal, anio) {
  const mapa = {}
  for (const f of kcal) if (f.anio === anio) mapa[f.iso3] = Number(f.valor)
  return mapa
}
// El número grande es la mediana de todos los países con dato ese año. La tendencia (cambio vs 2015 y mini
// gráfica) usa solo el "panel": países con dato en todos los años, para no confundir cambios de cobertura
// con cambios reales (Fase 2: 168 países, +70 kcal).
export function kpiPrincipal(kcal, anio, isos) {
  const anios = [...new Set(kcal.map((f) => f.anio))].sort()
  const conteo = {}
  for (const f of kcal) conteo[f.iso3] = (conteo[f.iso3] || 0) + 1
  const panel = new Set(Object.keys(conteo).filter((iso) => conteo[iso] === anios.length && isos.has(iso)))
  const valoresDe = (a, filtro) => kcal.filter((f) => f.anio === a && isos.has(f.iso3) && filtro(f.iso3)).map((f) => Number(f.valor))
  const todos = () => true
  const delPanel = (iso) => panel.has(iso)
  const actual = mediana(valoresDe(anio, todos))
  const actualPanel = mediana(valoresDe(anio, delPanel))
  const basePanel = mediana(valoresDe(anios[0], delPanel))
  const serie = anios.filter((a) => a <= anio).map((a) => ({ anio: a, kcal: mediana(valoresDe(a, delPanel)) }))
  return {
    mediana: actual,
    // se restan las medianas ya redondeadas (2,947 − 2,877), tal como se leen en pantalla y en la Fase 2
    cambio: actualPanel != null && basePanel != null ? Math.round(actualPanel) - Math.round(basePanel) : null,
    paisesPanel: panel.size,
    serie,
  }
}

// Dependencia de importación por país (%): importación / suministro interno, con la identidad del balance de la FAO
// (suministro interno = producción + importación − exportación − variación de existencias). Yemen, cereales 2023: 83%.
export function dependenciaPorPais(balance, grupo) {
  const t = {}
  for (const f of balance) {
    if (grupo !== 'Todos' && f.grupo !== grupo) continue
    t[f.iso3] ??= {}
    t[f.iso3][f.elemento] = (t[f.iso3][f.elemento] || 0) + Number(f.valor)
  }
  const out = {}
  for (const [iso, e] of Object.entries(t)) {
    const suministro = (e['Producción'] || 0) + (e['Importación'] || 0) - (e['Exportación'] || 0) - (e['Variación de existencias'] || 0)
    if (suministro > 0) out[iso] = ((e['Importación'] || 0) / suministro) * 100
  }
  return out
}

// Producción por país (Mt) para el grupo y año elegidos, con la marca de variación atípica
export function produccionPorPais(prod, { grupo, anio }) {
  const out = {}
  for (const f of prod) {
    if (f.anio !== anio || (grupo !== 'Todos' && f.grupo !== grupo)) continue
    out[f.iso3] ??= { mt: 0, atipica: false }
    out[f.iso3].mt += Number(f.toneladas) / 1e6
    if (Number(f.variacion_atipica) === 1) out[f.iso3].atipica = true
  }
  return out
}

// ---- Apoyo: países en riesgo (< 2,500 kcal) ----
export function paisesEnRiesgo(kcal, anio, isos) {
  const delAnio = kcal.filter((f) => f.anio === anio && isos.has(f.iso3))
  return { enRiesgo: delAnio.filter((f) => Number(f.valor) < UMBRAL_KCAL).length, total: delAnio.length }
}

// ---- Producción (KPI 1, 2, 3) ----
const filtrarProduccion = (prod, { isos, grupo, anio }) =>
  prod.filter((f) => isos.has(f.iso3) && (grupo === 'Todos' || f.grupo === grupo) && (anio == null || f.anio === anio))

export function produccionTotal(prod, filtros) {
  return sumar(filtrarProduccion(prod, filtros), 'toneladas') / 1e6 // millones de t
}

// Cambio porcentual de la producción respecto a 2015 con los mismos filtros (null si no hay base)
export function cambioProduccion(prod, filtros) {
  const actual = produccionTotal(prod, filtros)
  const base = produccionTotal(prod, { ...filtros, anio: 2015 })
  return base > 0 && filtros.anio !== 2015 ? ((actual - base) / base) * 100 : null
}

// KPI 1: producción por continente (ignora el filtro de continente para poder comparar)
export function produccionPorContinente(prod, paises, { grupo, anio }) {
  const cont = Object.fromEntries(paises.map((p) => [p.iso3, p.continente]))
  const tot = {}
  for (const f of prod) {
    if (f.anio !== anio || (grupo !== 'Todos' && f.grupo !== grupo)) continue
    const c = cont[f.iso3]
    tot[c] = (tot[c] || 0) + Number(f.toneladas)
  }
  const total = Object.values(tot).reduce((a, b) => a + b, 0)
  return Object.entries(tot)
    .map(([continente, t]) => ({ continente, mt: t / 1e6, pct: (t / total) * 100 }))
    .sort((a, b) => b.mt - a.mt)
}

// KPI 2: evolución por grupo de alimento (una columna por grupo)
export function evolucionPorGrupo(prod, isos, grupos) {
  const porAnio = {}
  for (const f of prod) {
    if (!isos.has(f.iso3)) continue
    porAnio[f.anio] ??= { anio: f.anio }
    porAnio[f.anio][f.grupo] = (porAnio[f.anio][f.grupo] || 0) + Number(f.toneladas) / 1e6
  }
  return Object.values(porAnio).sort((a, b) => a.anio - b.anio)
    .map((r) => ({ ...r, ...Object.fromEntries(grupos.filter((g) => r[g] == null).map((g) => [g, 0])) }))
}

// KPI 3: Top 10 productores o exportadores
export function topPaises({ prod, balance, paises, isos, grupo, anio, modo, n = 10 }) {
  const nombre = Object.fromEntries(paises.map((p) => [p.iso3, p.pais]))
  const tot = {}
  const filas = modo === 'productores'
    ? filtrarProduccion(prod, { isos, grupo, anio }).map((f) => ({ iso3: f.iso3, v: Number(f.toneladas) }))
    : balance.filter((f) => f.elemento === 'Exportación' && isos.has(f.iso3) && (grupo === 'Todos' || f.grupo === grupo))
        .map((f) => ({ iso3: f.iso3, v: Number(f.valor) }))
  for (const f of filas) tot[f.iso3] = (tot[f.iso3] || 0) + f.v
  return Object.entries(tot)
    .map(([iso3, t]) => ({ pais: nombre[iso3] || iso3, mt: t / 1e6 }))
    .sort((a, b) => b.mt - a.mt).slice(0, n)
}

// ---- KPI 4: destino de la producción (Sankey) ----
const USOS = ['Alimento', 'Piensos', 'Exportación', 'Otros usos', 'Pérdidas', 'Procesado', 'Semilla']

export const formatoCambio = (pct) => `${pct >= 0 ? '+' : '−'}${Number(Math.abs(pct)).toLocaleString('es-MX', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`
export function flujoDestino(balance, { isos, grupo }) {
  const tot = {}
  for (const f of balance) {
    if (!isos.has(f.iso3) || (grupo !== 'Todos' && f.grupo !== grupo)) continue
    tot[f.elemento] = (tot[f.elemento] || 0) + Number(f.valor)
  }
  const mt = (e) => (tot[e] || 0) / 1e6
  // Identidad del balance (FAO): producción + importación − exportación − variación de existencias = suministro interno
  const suministro = mt('Producción') + mt('Importación') - mt('Exportación') - mt('Variación de existencias')
  return {
    totales: {
      ...Object.fromEntries(['Producción', 'Importación', 'Variación de existencias', ...USOS].map((e) => [e, mt(e)])),
      'Suministro interno': suministro,
    },
  }
}

export const formato = (n, dec = 0) =>
  n == null ? '—' : Number(n).toLocaleString('es-MX', { minimumFractionDigits: dec, maximumFractionDigits: dec })
