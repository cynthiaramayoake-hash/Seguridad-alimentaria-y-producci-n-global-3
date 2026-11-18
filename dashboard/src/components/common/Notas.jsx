import Tarjeta from './Tarjeta'
import styles from './Notas.module.css'

// Nivel 3: información complementaria
export default function Notas({ fuente, anioBalance, anio, atipicos }) {
  return (
    <Tarjeta nivel={3} titulo="Notas y fuente">
      <div className={styles.notas}>
        <p><b>Fuente:</b> FAOSTAT (FAO), dominios de producción (QCL) y balances alimentarios (FBS).</p>
        <p><b>Cobertura:</b> 197 países con producción y 176 con balance alimentario.</p>
        <p><b>Calidad:</b> 59% de los datos de producción son oficiales; el resto, estimados por la FAO.</p>
        <p><b>Atípicos:</b> {atipicos} registros de producción con un cambio mayor a 50% frente al año anterior están marcados en la base.</p>
        <p><b>Mediana:</b> no está ponderada por población.</p>
        {anio > anioBalance && <p className={styles.aviso}>⚠ El balance alimentario llega hasta {anioBalance}: las calorías, exportaciones y destino muestran {anioBalance}.</p>}
        <p className={styles.fuente}>Datos servidos desde: <b>{fuente === 'supabase' ? 'PostgreSQL (Supabase)' : 'respaldo local (JSON)'}</b></p>
      </div>
    </Tarjeta>
  )
}
