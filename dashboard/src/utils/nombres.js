// Nombres cortos de países para tooltips y etiquetas: FAOSTAT usa nombres oficiales largos
// ("Federación de Rusia", "Estados Unidos de América"). Se usan en el Top 10 y en el mapa.
export const nombreCorto = (p) => p
  .replace('China, Continental', 'China').replace('Estados Unidos de América', 'EE. UU.')
  .replace('Federación de Rusia', 'Rusia').replace('República Unida de ', '')
  .replace('Reino Unido de Gran Bretaña e Irlanda del Norte', 'Reino Unido')
  .replace('República Democrática del Congo', 'R. D. del Congo')
  .replace(/ \(.*\)$/, '') // quita "(Estado Plurinacional de)", etc.
