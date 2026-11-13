import styles from './Filtros.module.css'

// Los tres filtros globales: cambian todas las tarjetas del dashboard
export default function Filtros({ filtros, setFiltros, opciones }) {
  const campo = (clave, etiqueta, lista) => (
    <label className={styles.filtro}>
      <span>{etiqueta}</span>
      <select value={filtros[clave]}
        onChange={(e) => setFiltros({ ...filtros, [clave]: clave === 'anio' ? Number(e.target.value) : e.target.value })}>
        {lista.map((v) => <option key={v} value={v}>{v}</option>)}
      </select>
    </label>
  )
  return (
    <div className={styles.filtros}>
      {campo('anio', 'Año', opciones.anios)}
      {campo('continente', 'Continente', opciones.continentes)}
      {campo('grupo', 'Grupo de alimento', opciones.grupos)}
    </div>
  )
}
