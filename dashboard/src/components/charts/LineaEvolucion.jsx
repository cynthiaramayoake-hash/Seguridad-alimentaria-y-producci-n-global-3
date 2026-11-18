import { useMemo, useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, usePlotArea, useYAxisScale } from 'recharts'
import Tarjeta from '../common/Tarjeta'
import Selector from '../common/Selector'
import TooltipCaja from '../common/TooltipCaja'
import { PALETA } from '../../styles/palette'
import { formato, formatoCambio } from '../../utils/kpis'
import { separar } from '../../utils/etiquetas'

const MODOS = [{ valor: 'indice', etiqueta: 'Índice 2015 = 100' }, { valor: 'mt', etiqueta: 'Millones de t' }]
const ANIOS_EJE = [2015, 2018, 2021, 2024]

// Etiquetas directas al final de cada línea (en lugar de leyenda), separadas a mano para que no se encimen
function EtiquetasFinales({ items }) {
  const area = usePlotArea()
  const escala = useYAxisScale()
  if (!area || !escala) return null
  const puestas = separar(items.map((i) => ({ ...i, y: escala(i.valor) })), 13, area.y + 4, area.y + area.height)
  return (
    <g>
      {puestas.map((p) => (
        <text key={p.nombre} x={area.x + area.width + 8} y={p.y + 4} fontSize={11} fontWeight={p.resaltado ? 700 : 400}
          fill={p.resaltado ? PALETA.carbon : PALETA.texto2}>{p.texto}</text>
      ))}
    </g>
  )
}

// KPI secundario 2: evolución 2015–2024 por grupo. Índice 2015 = 100 para que los 7 grupos compartan escala (Fase 2).
// Un grupo resaltado en turquesa (el del filtro); los otros 6, en gris.
export default function LineaEvolucion({ datos, grupos, resaltado, continente }) {
  const [modo, setModo] = useState('indice')

  const filas = useMemo(() => {
    const base = datos[0]
    return datos.map((f) => {
      const fila = { anio: f.anio }
      for (const g of grupos) fila[g] = modo === 'indice' ? (base?.[g] > 0 ? (f[g] / base[g]) * 100 : null) : f[g]
      return fila
    })
  }, [datos, grupos, modo])

  const ultima = filas.at(-1)
  const items = ultima ? grupos.filter((g) => ultima[g] != null).map((g) => ({
    nombre: g, valor: ultima[g], resaltado: g === resaltado,
    texto: modo === 'indice' ? `${g} ${formatoCambio(ultima[g] - 100)}` : `${g} ${formato(ultima[g])}`,
  })) : []

  // Eje Y en índice: marcas cada 10 (100, 110, 120…) dentro de un dominio que depende de los datos
  let dominioY = [0, 'auto']
  let marcasY
  if (modo === 'indice' && filas.length) {
    const v = filas.flatMap((f) => grupos.map((g) => f[g]).filter((x) => x != null))
    const bajo = Math.floor(Math.min(...v) / 5) * 5
    const alto = Math.ceil(Math.max(...v) / 5) * 5
    const paso = alto - bajo > 40 ? 20 : 10
    dominioY = [bajo, alto]
    marcasY = []
    for (let m = Math.ceil(bajo / paso) * paso; m <= alto; m += paso) marcasY.push(m)
  }
  const dibujo = [...grupos.filter((g) => g !== resaltado), resaltado] // el resaltado se dibuja encima

  return (
    <Tarjeta className="span2" titulo={`Evolución de la producción por grupo de alimento${continente === 'Todos' ? '' : ` · ${continente}`}`}
      subtitulo={`${modo === 'indice' ? 'Índice 2015 = 100 (2024 = valor más reciente)' : 'Millones de toneladas'} · resaltado: grupo del filtro (${resaltado})`}
      extra={<Selector valor={modo} onCambio={setModo} opciones={MODOS} />}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={filas} margin={{ top: 8, right: 150, left: 0, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke={PALETA.borde} />
          <XAxis dataKey="anio" type="number" domain={[2015, 2024]} ticks={ANIOS_EJE} tickLine={false} axisLine={false}
            tick={{ fontSize: 11, fill: PALETA.texto2 }} />
          <YAxis width={46} tickLine={false} axisLine={false} domain={dominioY} ticks={marcasY}
            tickFormatter={(v) => v.toLocaleString('es-MX')} tick={{ fontSize: 11, fill: PALETA.texto2 }} />
          <Tooltip content={<TooltipCaja unidad={modo === 'indice' ? '' : 'Mt'} />} />
          {dibujo.map((g) => (
            <Line key={g} dataKey={g} name={g} dot={false} activeDot={{ r: 3 }} isAnimationActive={false}
              stroke={g === resaltado ? PALETA.turquesa : PALETA.gris} strokeWidth={g === resaltado ? 2.8 : 1.5} />
          ))}
          <EtiquetasFinales items={items} />
        </LineChart>
      </ResponsiveContainer>
    </Tarjeta>
  )
}
