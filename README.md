# Dashboard de seguridad alimentaria y producción global

**Equipo:** Seguridad alimentaria y producción global

**Integrantes:**
- Ramayo Aké Cynthia Silvana (230300739)
- Gómez González Víctor Andrés (230300766)

**Materia:** Visualización de Datos · Mtra. Jessica Carmin Mendiola Fuentes · Universidad del Caribe

## Descripción
Dashboard estratégico desarrollado en React que muestra la producción, el comercio y la
disponibilidad de alimentos por país, continente y grupo de alimento (2015–2024), con datos
abiertos de FAOSTAT (FAO). Permite detectar desigualdades en la producción y el consumo de
alimentos e identificar regiones clave para la seguridad alimentaria global.

Los datos se almacenan en PostgreSQL (Supabase) y el dashboard se publicará en GitHub Pages o Vercel.

## Estructura
- `data/limpiar.py` – limpieza y transformación de los datos de FAOSTAT
- `data/schema.sql` – tablas de la base de datos
- `data/*.csv` – datos limpios (países, producción, balance alimentario)
- `docs/` – documentos entregados en cada fase

## Fases del proyecto
- **Fase 1 – Análisis:** audiencia, objetivos, limpieza de datos y tipo de dashboard → [`docs/Fase1_Justificacion.pdf`](docs/Fase1_Justificacion.pdf)
- **Fase 2 – Diseño:** KPIs, tipos de gráfico, paleta de colores, wireframe y cuadrícula → [`docs/Fase2_Diseno_dashboard.pdf`](docs/Fase2_Diseno_dashboard.pdf)

## Estado
- [x] Fase 1: Análisis
- [x] Fase 2: Diseño
- [ ] Fase 3
