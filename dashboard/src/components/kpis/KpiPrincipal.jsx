import { LineChart, Line, ResponsiveContainer, YAxis, Tooltip } from 'recharts'
import Tarjeta from '../common/Tarjeta'
import TooltipCaja from '../common/TooltipCaja'
import { PALETA } from '../../styles/palette'
import { formato } from '../../utils/kpis'
import styles from './Kpi.module.css'

// KPI principal (nivel 1): mediana de kcal por persona al día + tendencia desde 2015
export default function KpiPrincipal({ datos, anio, continente, aviso = '' }) {
  const { mediana, cambio, paisesPanel, serie } = datos
  return (
    <Tarjeta nivel={1} titulo={`Disponibilidad calórica${continente === 'Todos' ? '' : ' · ' + continente}`}
      subtitulo={`Mediana de países · kcal por persona al día, ${anio}${aviso}`}>
      <div className={styles.principal}>
        {formato(mediana)} <small>kcal</small>
      </div>
      <div className={styles.cambio}>
        <b>{cambio >= 0 ? '▲ +' : '▼ '}{formato(Math.abs(cambio))} kcal</b> vs 2015 · {paisesPanel} países
      </div>
      <div className={styles.mini}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={serie}>
            <YAxis hide domain={['dataMin - 20', 'dataMax + 20']} />
            <Tooltip content={<TooltipCaja unidad="kcal" />} labelFormatter={(_, p) => p?.[0]?.payload.anio} />
            <Line dataKey="kcal" name="Mediana" stroke={PALETA.turquesa} strokeWidth={2} isAnimationActive={false}
              dot={({ cx, cy, index }) => index === serie.length - 1
                ? <circle key="fin" cx={cx} cy={cy} r={3.5} fill={PALETA.turquesa} /> : <g key={index} />} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className={styles.anios}><span>{serie[0]?.anio}</span><span>{serie[serie.length - 1]?.anio}</span></div>
    </Tarjeta>
  )
}
