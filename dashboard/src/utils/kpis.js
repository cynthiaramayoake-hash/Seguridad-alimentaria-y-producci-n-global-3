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
export function kpiPrincipal(kcal, anio, isos) {
  const valoresDe = (a) => kcal.filter((f) => f.anio === a && isos.has(f.iso3)).map((f) => Number(f.valor))
  const actual = mediana(valoresDe(anio))
  const base = mediana(valoresDe(2015))
  const serie = [...new Set(kcal.map((f) => f.anio))].sort().map((a) => ({ anio: a, kcal: mediana(valoresDe(a)) }))
  return { mediana: actual, cambio: actual != null && base != null ? actual - base : null, serie }
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
    .map((r) => Object.fromEntries(Object.entries(r).map(([k, v]) => [k, k === 'anio' ? v : +v.toFixed(1)])))
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
    .map(([iso3, t]) => ({ pais: nombre[iso3] || iso3, mt: +(t / 1e6).toFixed(2) }))
    .sort((a, b) => b.mt - a.mt).slice(0, n)
}

// ---- KPI 4: destino de la producción (Sankey) ----
const USOS = ['Alimento', 'Piensos', 'Exportación', 'Otros usos', 'Pérdidas', 'Procesado', 'Semilla']
export function flujoDestino(balance, { isos, grupo }) {
  const tot = {}
  for (const f of balance) {
    if (!isos.has(f.iso3) || (grupo !== 'Todos' && f.grupo !== grupo)) continue
    tot[f.elemento] = (tot[f.elemento] || 0) + Number(f.valor)
  }
  const mt = (e) => Math.max(0, (tot[e] || 0) / 1e6)
  const nodos = [{ name: 'Producción' }, { name: 'Importación' }, { name: 'Suministro' }, ...USOS.map((u) => ({ name: u }))]
  const links = [
    { source: 0, target: 2, value: mt('Producción') },
    { source: 1, target: 2, value: mt('Importación') },
    ...USOS.map((u, i) => ({ source: 2, target: 3 + i, value: mt(u) })),
  ].filter((l) => l.value > 0.05)
  return { nodes: nodos, links, totales: Object.fromEntries(['Producción', 'Importación', ...USOS].map((e) => [e, mt(e)])) }
}

export const formato = (n, dec = 0) =>
  n == null ? '—' : Number(n).toLocaleString('es-MX', { minimumFractionDigits: dec, maximumFractionDigits: dec })
