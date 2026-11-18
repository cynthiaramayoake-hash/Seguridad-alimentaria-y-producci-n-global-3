import { BarChart, Bar, XAxis, YAxis, Cell, LabelList, Tooltip, ResponsiveContainer } from 'recharts'
import Tarjeta from '../common/Tarjeta'
import TooltipCaja from '../common/TooltipCaja'
import { PALETA } from '../../styles/palette'
import { formato } from '../../utils/kpis'

// KPI secundario 1: producción por continente (barras horizontales ordenadas)
export default function BarrasContinente({ datos, anio, grupo, continente }) {
  return (
    <Tarjeta titulo={`Producción de ${grupo === 'Todos' ? 'alimentos' : grupo.toLowerCase()} por continente`}
      subtitulo={`Millones de toneladas, ${anio} · ordenado de mayor a menor`}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={datos} layout="vertical" margin={{ top: 4, right: 56, left: 4, bottom: 0 }} barCategoryGap="28%">
          <XAxis type="number" hide />
          <YAxis type="category" dataKey="continente" width={74} axisLine={false} tickLine={false}
            tick={{ fontSize: 13, fill: PALETA.carbon }} />
          <Tooltip cursor={{ fill: '#F2EFE8' }} content={<TooltipCaja />} />
          <Bar dataKey="mt" name="Producción" radius={[0, 4, 4, 0]}>
            {datos.map((d) => (
              <Cell key={d.continente}
                fill={continente === 'Todos' || continente === d.continente ? PALETA.turquesa : PALETA.gris} />
            ))}
            <LabelList dataKey="mt" position="right" formatter={(v) => formato(v)}
              style={{ fontSize: 12.5, fontWeight: 700, fill: PALETA.carbon }} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Tarjeta>
  )
}
