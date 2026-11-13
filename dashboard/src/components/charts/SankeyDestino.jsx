import { Sankey, Tooltip, ResponsiveContainer, Layer, Rectangle } from 'recharts'
import Tarjeta from '../common/Tarjeta'
import { PALETA } from '../../styles/palette'
import { formato } from '../../utils/kpis'

const colorNodo = (n) => ({ Producción: PALETA.turquesa, Alimento: PALETA.turquesa, Pérdidas: PALETA.ambar, Suministro: PALETA.carbon }[n] || PALETA.gris)

// Nodo con su etiqueta y valor
function Nodo({ x, y, width, height, payload }) {
  const derecha = payload.depth === 2 // nodos de destino: etiqueta a la derecha
  return (
    <Layer>
      <Rectangle x={x} y={y} width={width} height={Math.max(height, 1.5)} fill={colorNodo(payload.name)} />
      {payload.name !== 'Suministro'
        ? <text x={derecha ? x + width + 8 : x - 8} y={y + height / 2 + 4} textAnchor={derecha ? 'start' : 'end'}
            fontSize={11.5} fill={PALETA.carbon}>{payload.name} {formato(payload.value)}</text>
        : <text x={x + width / 2} y={y + height + 14} textAnchor="middle" fontSize={11} fill={PALETA.texto2}>Suministro</text>}
    </Layer>
  )
}

// Flujo coloreado según su destino
function Enlace({ sourceX, sourceY, sourceControlX, targetX, targetY, targetControlX, linkWidth, payload }) {
  const destino = payload.target.name
  const color = destino === 'Suministro' ? colorNodo(payload.source.name) : colorNodo(destino)
  return (
    <path d={`M${sourceX},${sourceY} C${sourceControlX},${sourceY} ${targetControlX},${targetY} ${targetX},${targetY}`}
      stroke={color} strokeWidth={Math.max(linkWidth, 1)} strokeOpacity={destino === 'Alimento' || destino === 'Pérdidas' ? 0.5 : 0.3} fill="none" />
  )
}

// KPI secundario 4: a dónde va lo que se produce (Sankey)
export default function SankeyDestino({ datos, anio, grupo, continente }) {
  const vacio = !datos.links.length
  return (
    <Tarjeta className="span2" titulo={`¿A dónde va la producción? ${grupo === 'Todos' ? '7 grupos de alimento' : grupo}`}
      subtitulo={`Millones de toneladas · ${continente === 'Todos' ? 'mundo' : continente}, ${anio}`}>
      {vacio ? <p style={{ fontSize: 13, color: PALETA.texto2 }}>Sin datos para esta selección.</p> : (
        <ResponsiveContainer width="100%" height="100%">
          <Sankey data={datos} node={<Nodo />} link={<Enlace />} nodePadding={11} nodeWidth={8}
            margin={{ top: 6, right: 140, bottom: 18, left: 120 }} iterations={0} sort={false}>
            <Tooltip formatter={(v) => `${formato(v, 1)} Mt`} />
          </Sankey>
        </ResponsiveContainer>
      )}
    </Tarjeta>
  )
}
