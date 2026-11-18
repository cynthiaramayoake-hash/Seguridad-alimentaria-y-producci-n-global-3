import styles from './MapaPaises.module.css'

// Leyenda de clases con números (la Fase 2 pide no depender solo del color), marca "umbral 2,500" y "Sin dato"
export default function LeyendaMapa({ clases }) {
  return (
    <ul className={styles.leyenda} aria-label="Leyenda del mapa">
      {clases.map((c) => (
        <li key={c.etiqueta} className={styles.item}>
          {c.umbral && <span className={styles.umbral}><span className={styles.umbralTexto}>umbral 2,500</span></span>}
          <span className={styles.muestra} style={{ background: c.color }} />
          {c.etiqueta}
        </li>
      ))}
      <li className={styles.item}><span className={`${styles.muestra} ${styles.sinDato}`} />Sin dato</li>
    </ul>
  )
}
