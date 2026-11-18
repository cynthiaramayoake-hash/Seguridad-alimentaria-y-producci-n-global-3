import { useEffect, useRef, useState } from 'react'

// Mide el ancho y alto de un contenedor y se actualiza si cambia (para gráficos dibujados a mano en SVG).
export default function useTamano() {
  const ref = useRef(null)
  const [tamano, setTamano] = useState({ ancho: 0, alto: 0 })

  useEffect(() => {
    const el = ref.current
    if (!el) return undefined
    const observador = new ResizeObserver(([entrada]) => {
      const { width, height } = entrada.contentRect
      setTamano({ ancho: Math.floor(width), alto: Math.floor(height) })
    })
    observador.observe(el)
    return () => observador.disconnect()
  }, [])

  return [ref, tamano]
}
