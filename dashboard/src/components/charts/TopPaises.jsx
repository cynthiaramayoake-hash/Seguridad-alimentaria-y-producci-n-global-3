import { BarChart, Bar, XAxis, YAxis, LabelList, Tooltip, ResponsiveContainer } from 'recharts'
import Tarjeta from '../common/Tarjeta'
import Selector from '../common/Selector'
import TooltipCaja from '../common/TooltipCaja'
import { PALETA } from '../../styles/palette'

const corto = (p) => p.replace('China, Continental', 'China').replace('Estados Unidos de América', 'EE. UU.')
  .replace('Federación de Rusia', 'Rusia').replace('República Unida de ', '').replace('Reino Unido de Gran Bretaña e Irlanda del Norte', 'Reino Unido')
  .replace(/ \(.*\)$/, '') // quita "(Estado Plurinacional de)", etc.

// KPI secundario 3: Top 10 productores o exportadores (selector)
export default function TopPaises({ datos, modo, setModo, anio, grupo }) {
  return (
    <Tarjeta titulo={`Principales ${modo}`}
      subtitulo={`Millones de t · ${grupo === 'Todos' ? '7 grupos' : grupo}, ${anio}`}
      extra={<Selector valor={modo} onCambio={setModo}
        opciones={[{ valor: 'productores', etiqueta: 'Productores' }, { valor: 'exportadores', etiqueta: 'Exportadores' }]} />}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={datos.map((d) => ({ ...d, pais: corto(d.pais) }))} layout="vertical"
          margin={{ top: 0, right: 48, left: 0, bottom: 0 }} barCategoryGap="22%">
          <XAxis type="number" hide />
          <YAxis type="category" dataKey="pais" width={96} axisLine={false} tickLine={false} interval={0}
            tick={{ fontSize: 11.5, fill: PALETA.carbon }} />
          <Tooltip cursor={{ fill: '#F2EFE8' }} content={<TooltipCaja />} />
          <Bar dataKey="mt" name={modo === 'productores' ? 'Producción' : 'Exportación'} fill={PALETA.turquesa} radius={[0, 4, 4, 0]}>
            <LabelList dataKey="mt" position="right" style={{ fontSize: 11, fontWeight: 700, fill: PALETA.carbon }}
              formatter={(v) => v.toLocaleString('es-MX', { maximumFractionDigits: v < 10 ? 1 : 0 })} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Tarjeta>
  )
}
