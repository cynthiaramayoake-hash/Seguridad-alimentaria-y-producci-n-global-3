import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList } from 'recharts'
import Tarjeta from '../common/Tarjeta'
import TooltipCaja from '../common/TooltipCaja'
import { PALETA } from '../../styles/palette'

// KPI secundario 2: evolución 2015–2024 por grupo. Un grupo resaltado en ámbar, el resto en gris.
export default function LineaEvolucion({ datos, grupos, resaltado, continente }) {
  const orden = [...grupos.filter((g) => g !== resaltado), resaltado] // el resaltado se dibuja al final (encima)
  const etiqueta = (g) => ({ index, x, y }) =>
    index === datos.length - 1 && g === resaltado
      ? <text x={x + 8} y={y + 4} fontSize={g === resaltado ? 12 : 10.5} fontWeight={g === resaltado ? 700 : 400}
          fill={g === resaltado ? PALETA.carbon : PALETA.texto2}>{g}</text>
      : null
  return (
    <Tarjeta className="span2" titulo="Evolución de la producción por grupo de alimento"
      subtitulo={`Millones de toneladas · ${continente === 'Todos' ? 'mundo' : continente} · en gris, los otros 6 grupos (pasa el cursor para verlos)`}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={datos} margin={{ top: 8, right: 110, left: 0, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke={PALETA.borde} />
          <XAxis dataKey="anio" tick={{ fontSize: 11, fill: PALETA.texto2 }} axisLine={{ stroke: PALETA.borde }} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: PALETA.texto2 }} axisLine={false} tickLine={false} width={52}
            tickFormatter={(v) => v.toLocaleString('es-MX')} />
          <Tooltip content={<TooltipCaja />} />
          {orden.map((g) => (
            <Line key={g} dataKey={g} name={g} dot={false} isAnimationActive={false}
              stroke={g === resaltado ? PALETA.ambar : PALETA.gris} strokeWidth={g === resaltado ? 3 : 1.6}>
              <LabelList content={etiqueta(g)} />
            </Line>
          ))}
        </LineChart>
      </ResponsiveContainer>
    </Tarjeta>
  )
}
