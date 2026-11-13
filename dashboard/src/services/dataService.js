// Capa de datos: todas las consultas del dashboard pasan por aquí.
// Fuente principal: PostgreSQL en Supabase. Respaldo: JSON locales en public/data.
import { supabase } from './supabaseClient'
import { DATA_SOURCE } from '../config/supabase'

export const GRUPOS = ['Cereales', 'Frutas', 'Verduras', 'Raíces y tubérculos', 'Carne', 'Leche', 'Huevos']
export const ELEMENTOS_FLUJO = ['Producción', 'Importación', 'Exportación', 'Variación de existencias',
  'Alimento', 'Piensos', 'Semilla', 'Pérdidas', 'Procesado', 'Otros usos']

const PAGINA = 1000 // Supabase devuelve como máximo 1,000 filas por consulta
// Orden por la llave primaria: así las páginas no se repiten ni se saltan filas
const LLAVES = { paises: ['iso3'], produccion: ['iso3', 'grupo', 'anio'], balance_alimentario: ['iso3', 'grupo', 'elemento', 'anio'] }
const ordenar = (q, tabla) => LLAVES[tabla].reduce((acc, col) => acc.order(col), q)

// Trae todas las filas de una tabla (con filtros opcionales), pidiendo las páginas en paralelo.
// En supabase-js los filtros (.eq, .in) van DESPUÉS de .select()
async function traerTodo(tabla, filtrar = (q) => q) {
  const { count, error } = await filtrar(supabase.from(tabla).select('*', { count: 'exact', head: true }))
  if (error) throw error
  const paginas = Math.ceil((count || 0) / PAGINA)
  const resultados = await Promise.all(
    Array.from({ length: paginas }, (_, i) =>
      ordenar(filtrar(supabase.from(tabla).select('*')), tabla).range(i * PAGINA, (i + 1) * PAGINA - 1)),
  )
  const filas = []
  for (const { data, error: e } of resultados) {
    if (e) throw e
    filas.push(...data)
  }
  return filas
}

const desdeSupabase = {
  paises: () => traerTodo('paises'),
  produccion: () => traerTodo('produccion'),
  kcal: () => traerTodo('balance_alimentario', (q) => q
    .eq('grupo', 'Total general').eq('elemento', 'kcal/cápita/día')),
  balanceAnio: (anio) => traerTodo('balance_alimentario', (q) => q
    .eq('anio', anio).in('grupo', GRUPOS).in('elemento', ELEMENTOS_FLUJO)),
}

const leerJson = async (archivo) => {
  const r = await fetch(`${import.meta.env.BASE_URL}data/${archivo}`)
  if (!r.ok) throw new Error(`No se pudo leer ${archivo}`)
  return r.json()
}
const desdeLocal = {
  paises: () => leerJson('paises.json'),
  produccion: () => leerJson('produccion.json'),
  kcal: () => leerJson('kcal.json'),
  balanceAnio: (anio) => leerJson(`balance_${anio}.json`),
}

// Estado compartido: de dónde salieron los datos (se muestra en el dashboard)
let fuenteActual = DATA_SOURCE === 'local' ? 'local' : 'supabase'
export const fuenteDeDatos = () => fuenteActual

const conLimite = (promesa, ms) => Promise.race([
  promesa,
  new Promise((_, rechazar) => setTimeout(() => rechazar(new Error('Supabase tardó demasiado')), ms)),
])

// Intenta Supabase; si falla o tarda más de 12 s (sin internet, proyecto pausado), usa el respaldo local
async function consultar(nombre, ...args) {
  if (fuenteActual === 'supabase') {
    try {
      return await conLimite(desdeSupabase[nombre](...args), 12000)
    } catch (err) {
      console.warn(`Supabase no respondió (${nombre}), se usa el respaldo local`, err)
      fuenteActual = 'local'
    }
  }
  return desdeLocal[nombre](...args)
}

export const obtenerPaises = () => consultar('paises')
export const obtenerProduccion = () => consultar('produccion')
export const obtenerKcal = () => consultar('kcal')
export const obtenerBalanceAnio = (anio) => consultar('balanceAnio', anio)
