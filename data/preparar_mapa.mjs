// Genera dashboard/public/paises.geojson a partir de Natural Earth (110 m, dominio público).
//
// ¿Por qué no se usa el GeoJSON original tal cual?
//  - Se proyecta de antemano con la proyección Natural Earth (la misma del mockup de la Fase 2) para que el mapa
//    del dashboard tenga exactamente esa forma. Así el navegador no recalcula nada y no hace falta d3-geo en la app.
//  - Se quita la Antártida (el mockup tampoco la dibuja) y se conservan solo las propiedades necesarias.
//  - Las coordenadas se redondean a 1 decimal (el archivo pasa de ~840 KB a ~250 KB).
//
// Las coordenadas quedan como [x, -y] en un plano de 1000 × ~500 unidades: Leaflet con L.CRS.Simple las
// interpreta como [lng, lat] y el eje y invertido deja el norte arriba.
//
// Uso (solo si hay que regenerar el archivo; el resultado ya está en el repositorio):
//   1. Descargar ne_110m_admin_0_countries.geojson de
//      https://github.com/nvkelso/natural-earth-vector/tree/master/geojson
//   2. npm install --no-save d3-geo        (en una carpeta temporal; no es dependencia del dashboard)
//   3. node preparar_mapa.mjs ne_110m_admin_0_countries.geojson ../dashboard/public/paises.geojson
import fs from 'node:fs'
import { geoNaturalEarth1 } from 'd3-geo'

const [entrada, salida] = process.argv.slice(2)
const origen = JSON.parse(fs.readFileSync(entrada, 'utf8'))
const ANCHO = 1000

const paises = origen.features.filter((f) => f.properties.ADM0_A3 !== 'ATA')
const proyeccion = geoNaturalEarth1().fitWidth(ANCHO, { type: 'FeatureCollection', features: paises })
const redondear = (n) => Math.round(n * 10) / 10
const punto = (c) => {
  const [x, y] = proyeccion(c)
  return [redondear(x), redondear(-y)]
}
const anillo = (a) => a.map(punto)

const features = paises.map((f) => {
  const p = f.properties
  // ISO_A3_EH corrige los -99 de Francia, Noruega, etc.; si aun así no hay código se usa ADM0_A3.
  const iso3 = p.ISO_A3_EH && p.ISO_A3_EH !== '-99' ? p.ISO_A3_EH : p.ADM0_A3
  const g = f.geometry
  const coordinates = g.type === 'Polygon' ? g.coordinates.map(anillo) : g.coordinates.map((poli) => poli.map(anillo))
  return { type: 'Feature', properties: { iso3, nombre: p.NAME }, geometry: { type: g.type, coordinates } }
})

// Encuadres del filtro de continente: cajas [oeste, sur, este, norte] en grados, proyectadas al mismo plano.
// Se guardan como [[lat mínima, x mínima], [lat máxima, x máxima]] (el orden que usa Leaflet).
const CAJAS = {
  África: [-20, -36, 52, 38], América: [-130, -56, -32, 72], Asia: [25, -12, 150, 62],
  Europa: [-25, 34, 45, 71], Oceanía: [110, -48, 180, 0],
}
const encuadre = (puntos) => {
  const xs = puntos.map((p) => p[0])
  const ys = puntos.map((p) => p[1])
  return [[Math.min(...ys), Math.min(...xs)], [Math.max(...ys), Math.max(...xs)]]
}
const encuadres = { Todos: encuadre(features.flatMap((f) => JSON.stringify(f.geometry.coordinates).match(/-?\d+\.?\d*,-?\d+\.?\d*/g).map((t) => t.split(',').map(Number)))) }
for (const [nombre, [o, s, e, n]] of Object.entries(CAJAS)) {
  const borde = []
  for (let i = 0; i <= 20; i++) {
    const lon = o + ((e - o) * i) / 20
    const lat = s + ((n - s) * i) / 20
    borde.push(punto([lon, s]), punto([lon, n]), punto([o, lat]), punto([e, lat]))
  }
  encuadres[nombre] = encuadre(borde)
}

fs.writeFileSync(salida, JSON.stringify({ type: 'FeatureCollection', encuadres, features }))
console.log(`${features.length} países escritos en ${salida}`)
