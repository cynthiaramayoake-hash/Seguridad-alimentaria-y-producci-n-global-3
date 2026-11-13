// Conexión a la base de datos PostgreSQL alojada en Supabase.
// La publishable key es pública por diseño: solo permite LEER,
// porque las tablas tienen políticas RLS de solo lectura.
export const SUPABASE_URL = 'https://nljmxhifnpssclkrnbr.supabase.co'
export const SUPABASE_KEY = 'sb_publishable_L-SFnToF83t3lZAnLwWw9Q_Gw6EqHRE'

// 'supabase' (normal) o 'local' (lee los JSON de public/data, útil para pruebas sin internet)
export const DATA_SOURCE = import.meta.env.VITE_DATA_SOURCE || 'supabase'
