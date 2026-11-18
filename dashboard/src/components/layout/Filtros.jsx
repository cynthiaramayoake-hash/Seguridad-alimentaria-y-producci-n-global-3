import { useEffect, useId, useRef, useState } from 'react'
import styles from './Filtros.module.css'

// Selector propio (en lugar del <select> nativo, cuya lista no se puede estilizar).
// Funciona con ratón y teclado: flechas, Inicio/Fin, Enter o Espacio para elegir, Esc para cerrar.
function Campo({ etiqueta, valor, lista, onCambiar }) {
  const [abierto, setAbierto] = useState(false)
  const [activo, setActivo] = useState(0)
  const raiz = useRef(null)
  const id = useId()

  // Cierra al hacer clic fuera del selector
  useEffect(() => {
    if (!abierto) return undefined
    const fuera = (e) => { if (!raiz.current?.contains(e.target)) setAbierto(false) }
    document.addEventListener('mousedown', fuera)
    return () => document.removeEventListener('mousedown', fuera)
  }, [abierto])

  // Mantiene visible la opción activa cuando la lista es larga
  useEffect(() => {
    if (abierto) document.getElementById(`${id}-${activo}`)?.scrollIntoView({ block: 'nearest' })
  }, [abierto, activo, id])

  const abrir = () => { setActivo(Math.max(0, lista.indexOf(valor))); setAbierto(true) }
  const elegir = (v) => { onCambiar(v); setAbierto(false) }

  const teclas = (e) => {
    if (e.key === 'Escape') { setAbierto(false); return }
    if (e.key === 'Tab') { setAbierto(false); return }
    if (['ArrowDown', 'ArrowUp', 'Home', 'End', 'Enter', ' '].includes(e.key)) e.preventDefault()
    if (!abierto) { if (e.key !== 'Home' && e.key !== 'End') abrir(); return }
    if (e.key === 'ArrowDown') setActivo((a) => Math.min(lista.length - 1, a + 1))
    else if (e.key === 'ArrowUp') setActivo((a) => Math.max(0, a - 1))
    else if (e.key === 'Home') setActivo(0)
    else if (e.key === 'End') setActivo(lista.length - 1)
    else if (e.key === 'Enter' || e.key === ' ') elegir(lista[activo])
  }

  return (
    <div className={styles.filtro} ref={raiz}>
      <span id={`${id}-etiqueta`} className={styles.etiqueta}>{etiqueta}</span>
      <button type="button" className={styles.boton} aria-haspopup="listbox" aria-expanded={abierto}
        aria-labelledby={`${id}-etiqueta`} onClick={() => (abierto ? setAbierto(false) : abrir())} onKeyDown={teclas}>
        <span>{valor}</span>
        <svg className={`${styles.flecha} ${abierto ? styles.girada : ''}`} width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
          <path d="M2.5 4.5 6 8l3.5-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {abierto && (
        <ul className={styles.lista} role="listbox" aria-labelledby={`${id}-etiqueta`}>
          {lista.map((v, i) => (
            <li key={v} id={`${id}-${i}`} role="option" aria-selected={v === valor}
              className={`${styles.opcion} ${v === valor ? styles.elegida : ''} ${i === activo ? styles.activa : ''}`}
              onMouseEnter={() => setActivo(i)} onMouseDown={(e) => e.preventDefault()} onClick={() => elegir(v)}>
              <span>{v}</span>
              {v === valor && <span className={styles.punto} aria-hidden="true" />}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

// Los tres filtros globales: cambian todas las tarjetas del dashboard
export default function Filtros({ filtros, setFiltros, opciones }) {
  const campo = (clave, etiqueta, lista) => (
    <Campo etiqueta={etiqueta} valor={filtros[clave]} lista={lista}
      onCambiar={(v) => setFiltros({ ...filtros, [clave]: clave === 'anio' ? Number(v) : v })} />
  )
  return (
    <div className={styles.filtros}>
      {campo('anio', 'Año', opciones.anios)}
      {campo('continente', 'Continente', opciones.continentes)}
      {campo('grupo', 'Grupo de alimento', opciones.grupos)}
    </div>
  )
}
