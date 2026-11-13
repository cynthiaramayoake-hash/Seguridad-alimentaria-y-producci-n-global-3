import Filtros from './Filtros'
import styles from './Encabezado.module.css'

// Fila 1 del wireframe: título general + filtros globales
export default function Encabezado({ filtros, setFiltros, opciones }) {
  return (
    <header className={styles.encabezado}>
      <div>
        <h1 className={styles.titulo}>Seguridad alimentaria y producción global</h1>
        <p className={styles.sub}>Producción y disponibilidad de alimentos por país · FAOSTAT 2015–2024</p>
      </div>
      <Filtros filtros={filtros} setFiltros={setFiltros} opciones={opciones} />
    </header>
  )
}
