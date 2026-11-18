import Tarjeta from '../common/Tarjeta'
import styles from './Kpi.module.css'

// KPIs secundarios del panel superior (nivel 2)
export default function KpiTarjeta({ titulo, subtitulo, valor, unidad, nota, color, marca }) {
  return (
    <Tarjeta titulo={titulo} subtitulo={subtitulo}>
      <div className={styles.valor}>{valor} <small>{unidad}</small></div>
      <div className={styles.nota}>{marca !== '' && <span className={styles.punto} style={{ background: color }} />}{nota}</div>
    </Tarjeta>
  )
}
