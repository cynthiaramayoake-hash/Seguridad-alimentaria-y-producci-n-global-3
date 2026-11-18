// Separa verticalmente etiquetas que se encimarían (Top 10, extremos de la línea, Sankey).
// items: [{ y, ... }]; minimo: separación mínima en px; desde/hasta: límites. Devuelve los items ordenados y ajustados.
export function separar(items, minimo, desde, hasta) {
  const lista = items.map((i) => ({ ...i })).sort((a, b) => a.y - b.y)
  for (let vuelta = 0; vuelta < 60; vuelta++) {
    for (let i = 1; i < lista.length; i++) {
      const hueco = lista[i].y - lista[i - 1].y
      if (hueco < minimo) {
        const mitad = (minimo - hueco) / 2
        lista[i].y += mitad
        lista[i - 1].y -= mitad
      }
    }
    lista.forEach((it) => {
      it.y = Math.max(desde, Math.min(hasta, it.y))
    })
  }
  return lista
}
