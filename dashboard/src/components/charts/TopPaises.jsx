import { BarChart, Bar, XAxis, YAxis, LabelList, Tooltip, ResponsiveContainer } from 'recharts'
import Tarjeta from '../common/Tarjeta'
import Selector from '../common/Selector'
import TooltipCaja from '../common/TooltipCaja'
import { PALETA } from '../../styles/palette'
import { nombreCorto } from '../../utils/nombres'

// KPI secundario 3: Top 10 productores o exportadores (selector)
export default function TopPaises({ datos, modo, setModo, anio, grupo }) {
  return (
    <Tarjeta titulo={`Top 10 ${modo}${grupo === 'Todos' ? '' : ' de ' + grupo.toLowerCase()}`}
      subtitulo={`Millones de toneladas, ${anio}${grupo === 'Todos' ? ' · 7 grupos' : ''}`}
      extra={<Selector valor={modo} onCambio={setModo}
        opciones={[{ valor: 'productores', etiqueta: 'Productores' }, { valor: 'exportadores', etiqueta: 'Exportadores' }]} />}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={datos.map((d) => ({ ...d, pais: nombreCorto(d.pais) }))} layout="vertical"
          margin={{ top: 0, right: 56, left: 0, bottom: 0 }} barCategoryGap="22%">
          <XAxis type="number" hide />
          <YAxis type="category" dataKey="pais" width={96} axisLine={false} tickLine={false} interval={0}
            tick={{ fontSize: 11.5, fill: PALETA.carbon }} />
          <Tooltip cursor={{ fill: '#F2EFE8' }} content={<TooltipCaja />} />
          <Bar dataKey="mt" name={modo === 'productores' ? 'Producción' : 'Exportación'} fill={PALETA.turquesa} radius={[0, 4, 4, 0]}>
            <LabelList dataKey="mt" position="right" style={{ fontSize: 11, fontWeight: 700, fill: PALETA.carbon }}
              formatter={(v) => (v < 0.005 ? '<0.01 Mt' : `${v.toLocaleString('es-MX', { maximumFractionDigits: v >= 10 ? 0 : v >= 1 ? 1 : 2 })} Mt`)} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Tarjeta>
  )
}
