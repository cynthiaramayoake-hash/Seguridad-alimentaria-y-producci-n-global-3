import styles from './TooltipCaja.module.css'

// Tooltip con el mismo estilo para todas las gráficas de Recharts
export default function TooltipCaja({ active, payload, label, unidad = 'Mt', titulo }) {
  if (!active || !payload?.length) return null
  return (
    <div className={styles.caja}>
      <strong>{titulo ?? label}</strong>
      {payload.map((p) => (
        <div key={p.dataKey ?? p.name}>
          <span className={styles.punto} style={{ background: p.color || p.payload?.fill }} />
          {p.name}: {Number(p.value).toLocaleString('es-MX', { maximumFractionDigits: 1 })} {unidad}
        </div>
      ))}
    </div>
  )
}
