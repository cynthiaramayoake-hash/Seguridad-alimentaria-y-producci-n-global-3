import { useEffect, useState } from 'react'
import { obtenerPaises, obtenerProduccion, obtenerKcal, obtenerBalanceAnio, fuenteDeDatos } from '../services/dataService'

export const ULTIMO_ANIO_BALANCE = 2023 // el balance alimentario de la FAO llega hasta 2023

// Carga los datos base una vez y el balance del año elegido cada vez que cambia
export function useDashboardData(anio) {
  const [base, setBase] = useState(null)
  const [balance, setBalance] = useState({ anio: null, filas: [] })
  const [error, setError] = useState(null)
  const anioBalance = Math.min(anio, ULTIMO_ANIO_BALANCE)

  useEffect(() => {
    Promise.all([obtenerPaises(), obtenerProduccion(), obtenerKcal()])
      .then(([paises, produccion, kcal]) => setBase({ paises, produccion, kcal }))
      .catch(setError)
  }, [])

  useEffect(() => {
    let vigente = true
    obtenerBalanceAnio(anioBalance)
      .then((filas) => vigente && setBalance({ anio: anioBalance, filas }))
      .catch(setError)
    return () => { vigente = false }
  }, [anioBalance])

  return {
    cargando: !base,
    actualizandoBalance: balance.anio !== anioBalance,
    error,
    fuente: base ? fuenteDeDatos() : null,
    anioBalance,
    ...(base || { paises: [], produccion: [], kcal: [] }),
    balance: balance.filas,
  }
}
