// Trama rayada de "Sin dato". Leaflet pinta con fill="url(#sindato)"; los <defs> viven en un SVG aparte de
// tamaño cero porque una referencia url(#id) funciona entre SVG del mismo documento.
export default function PatronSinDato() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true" focusable="false">
      <defs>
        <pattern id="sindato" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="6" height="6" fill="#F2F0EB" />
          <line x1="0" y1="0" x2="0" y2="6" stroke="#CFCBC2" strokeWidth="1.5" />
        </pattern>
      </defs>
    </svg>
  )
}
