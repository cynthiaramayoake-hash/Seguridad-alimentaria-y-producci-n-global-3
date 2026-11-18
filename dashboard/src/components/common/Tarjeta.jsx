import styles from './Tarjeta.module.css'

// Contenedor común de cada zona del dashboard: título, subtítulo con unidad y contenido
export default function Tarjeta({ titulo, subtitulo, extra, className = '', children, nivel = 2, id }) {
  return (
    <section id={id} className={`${styles.tarjeta} ${styles['nivel' + nivel]} ${className}`}>
      <header className={styles.encabezado}>
        <div>
          <h2 className={styles.titulo}>{titulo}</h2>
          {subtitulo && <p className={styles.subtitulo}>{subtitulo}</p>}
        </div>
        {extra}
      </header>
      <div className={styles.cuerpo}>{children}</div>
    </section>
  )
}
