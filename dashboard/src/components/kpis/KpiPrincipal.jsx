import { LineChart, Line, ResponsiveContainer, YAxis, Tooltip } from 'recharts'
import Tarjeta from '../common/Tarjeta'
import TooltipCaja from '../common/TooltipCaja'
import { PALETA } from '../../styles/palette'
import { formato } from '../../utils/kpis'
import styles from './Kpi.module.css'

// KPI principal (nivel 1): mediana de kcal por persona al día + tendencia desde 2015
export default function KpiPrincipal({ datos, anio, continente }) {
  const { mediana, cambio, serie } = datos
  return (
    <Tarjeta nivel={1} titulo="KPI principal · Disponibilidad calórica"
      subtitulo={`Mediana por persona al día · ${continente === 'Todos' ? 'mundo' : continente}, ${anio}`}>
      <div className={styles.principal}>
        {formato(mediana)} <small>kcal</small>
      </div>
      <div className={styles.cambio}>
        <b style={{ color: cambio >= 0 ? PALETA.turquesa : PALETA.ambar }}>
          {cambio >= 0 ? '▲ +' : '▼ '}{formato(cambio)} kcal
        </b> vs 2015
      </div>
      <div className={styles.mini}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={serie}>
            <YAxis hide domain={['dataMin - 20', 'dataMax + 20']} />
            <Tooltip content={<TooltipCaja unidad="kcal" />} labelFormatter={(_, p) => p?.[0]?.payload.anio} />
            <Line dataKey="kcal" name="Mediana" stroke={PALETA.turquesa} strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Tarjeta>
  )
}
