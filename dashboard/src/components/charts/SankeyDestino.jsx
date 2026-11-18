import { useMemo } from 'react'
import Tarjeta from '../common/Tarjeta'
import useTamano from '../../hooks/useTamano'
import { PALETA } from '../../styles/palette'
import { formato } from '../../utils/kpis'
import { separar } from '../../utils/etiquetas'
import { calcularDiseno, construirFlujos, trazoEnlace } from '../../utils/sankey'

// KPI secundario 4: destino de la producción (Sankey de 3 niveles). Nodos en carbón, "Alimento" en turquesa, flujos en gris.
export default function SankeyDestino({ datos, anio, grupo, continente }) {
  const [ref, { ancho, alto }] = useTamano()
  const flujos = useMemo(() => construirFlujos(datos.totales), [datos])
  const diseno = useMemo(() => (flujos && ancho > 0 && alto > 0 ? calcularDiseno(flujos, ancho, alto) : null), [flujos, ancho, alto])

  // Etiquetas por columna, separadas para que no se encimen; las de la columna 2 (oferta → exportación…) van a la izquierda del nodo
  const etiquetas = useMemo(() => {
    if (!diseno) return []
    const porColumna = {}
    diseno.nodes.forEach((n) => {
      porColumna[n.depth] ??= []
      porColumna[n.depth].push({ nodo: n, y: (n.y0 + n.y1) / 2 })
    })
    return Object.values(porColumna).flatMap((col) => separar(col, 13, 8, alto - 4))
  }, [diseno, alto])

  const queGrupo = grupo === 'Todos' ? '7 grupos de alimento' : grupo.toLowerCase()
  return (
    <Tarjeta className="span2" titulo={`¿A dónde va la producción de ${queGrupo}? ${continente === 'Todos' ? 'Mundo' : continente}, ${anio}`}
      subtitulo="Millones de toneladas · producción + importación = exportación + existencias + suministro interno">
      <div ref={ref} style={{ position: 'absolute', inset: 0 }}>
        {!diseno ? (
          <p style={{ fontSize: 13, color: PALETA.texto2 }}>Sin datos para esta selección.</p>
        ) : (
          <svg width={ancho} height={alto} role="img" aria-label={`Diagrama de Sankey del destino de la producción de ${queGrupo}`}>
            <g fill="none">
              {diseno.links.map((e) => (
                <path key={`${e.source.nombre}-${e.target.nombre}`} d={trazoEnlace(e)}
                  stroke={e.target.nombre === 'Alimento' ? PALETA.turquesaClaro : PALETA.grisClaro} strokeWidth={Math.max(e.width, 1)}>
                  <title>{`${e.source.nombre} → ${e.target.nombre}: ${formato(e.value, 1)} Mt`}</title>
                </path>
              ))}
            </g>
            {diseno.nodes.map((n) => (
              <rect key={n.nombre} x={n.x0} y={n.y0} width={n.x1 - n.x0} height={Math.max(n.y1 - n.y0, 1.5)}
                fill={n.nombre === 'Alimento' ? PALETA.turquesa : PALETA.carbon}>
                <title>{`${n.nombre}: ${formato(n.valor, 1)} Mt`}</title>
              </rect>
            ))}
            {etiquetas.map(({ nodo, y }) => {
              const izquierda = nodo.depth === 2
              return (
                <text key={nodo.nombre} x={izquierda ? nodo.x0 - 6 : nodo.x1 + 6} y={y + 4} textAnchor={izquierda ? 'end' : 'start'}
                  fontSize={11.5} fontWeight={nodo.nombre === 'Oferta total' || nodo.nombre === 'Alimento' ? 700 : 400} fill={PALETA.carbon}>
                  {`${nodo.nombre} ${formato(nodo.valor)}`}
                </text>
              )
            })}
          </svg>
        )}
      </div>
    </Tarjeta>
  )
}
