import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/inter/400.css'
import '@fontsource/inter/600.css'
import '@fontsource/inter/700.css'
import '@fontsource/inter/800.css'
import 'leaflet/dist/leaflet.css'
import './styles/global.css'
import { PALETA } from './styles/palette'
import App from './App'

// Convierte la paleta en variables CSS para que los estilos usen los mismos colores
for (const [nombre, color] of Object.entries(PALETA)) {
  document.documentElement.style.setProperty(`--${nombre}`, color)
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
