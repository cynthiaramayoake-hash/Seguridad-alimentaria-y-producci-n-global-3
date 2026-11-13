import styles from './Selector.module.css'

// Botones de dos opciones (ej. Productores / Exportadores)
export default function Selector({ opciones, valor, onCambio }) {
  return (
    <div className={styles.selector} role="tablist">
      {opciones.map((o) => (
        <button key={o.valor} role="tab" aria-selected={valor === o.valor}
          className={valor === o.valor ? styles.activo : ''} onClick={() => onCambio(o.valor)}>
          {o.etiqueta}
        </button>
      ))}
    </div>
  )
}
