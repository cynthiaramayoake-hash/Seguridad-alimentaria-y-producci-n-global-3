import { sankey, sankeyLeft, sankeyLinkHorizontal } from 'd3-sankey'

const USOS = ['Alimento', 'Piensos', 'Otros usos', 'Pérdidas', 'Procesado', 'Semilla']

// Convierte los totales del balance (en Mt) en nodos y enlaces de un Sankey de 3 niveles, como en la Fase 2:
//   producción + importación → oferta total → exportación + existencias + suministro interno → usos
// Si la variación de existencias es negativa, el país sacó de sus reservas: entra como oferta ("De existencias").
export function construirFlujos(t) {
  const produccion = Math.max(0, t['Producción'] || 0)
  const importacion = Math.max(0, t['Importación'] || 0)
  const exportacion = Math.max(0, t['Exportación'] || 0)
  const existencias = t['Variación de existencias'] || 0
  const suministro = Math.max(0, t['Suministro interno'] || 0)
  if (produccion <= 0 && importacion <= 0) return null

  const deExistencias = existencias < 0 ? -existencias : 0
  const aExistencias = existencias > 0 ? existencias : 0
  const valores = {
    'Producción': produccion, 'Importación': importacion, 'De existencias': deExistencias,
    'Oferta total': produccion + importacion + deExistencias, 'Exportación': exportacion,
    'A existencias': aExistencias, 'Suministro interno': suministro,
  }
  USOS.forEach((u) => (valores[u] = Math.max(0, t[u] || 0))) // la etiqueta muestra el dato real del balance

  const enlaces = []
  const unir = (source, target, value) => value > 0.01 && enlaces.push({ source, target, value })
  unir('Producción', 'Oferta total', produccion)
  unir('Importación', 'Oferta total', importacion)
  unir('De existencias', 'Oferta total', deExistencias)
  unir('Oferta total', 'Exportación', exportacion)
  unir('Oferta total', 'A existencias', aExistencias)
  unir('Oferta total', 'Suministro interno', suministro)
  USOS.forEach((u) => unir('Suministro interno', u, valores[u]))

  const orden = ['Producción', 'Importación', 'De existencias', 'Oferta total', 'Exportación', 'A existencias', 'Suministro interno', ...USOS]
  const usados = new Set(enlaces.flatMap((e) => [e.source, e.target]))
  return { nodos: orden.filter((n) => usados.has(n)).map((nombre) => ({ nombre, valor: valores[nombre] })), enlaces }
}

// Posiciones con d3-sankey (algoritmo estándar de diagramas de Sankey). Se usa en lugar del componente Sankey de
// Recharts porque este no permite separar a mano las etiquetas de los nodos pequeños (Otros usos, Pérdidas…).
export function calcularDiseno({ nodos, enlaces }, ancho, alto, margenDerecho = 130) {
  return sankey()
    .nodeId((d) => d.nombre)
    .nodeAlign(sankeyLeft)
    .nodeWidth(10)
    .nodePadding(7)
    .nodeSort(null)
    .linkSort(null)
    .extent([[0, 4], [Math.max(ancho - margenDerecho, 50), Math.max(alto - 4, 50)]])({
      nodes: nodos.map((n) => ({ ...n })),
      links: enlaces.map((e) => ({ ...e })),
    })
}

export const trazoEnlace = sankeyLinkHorizontal()
