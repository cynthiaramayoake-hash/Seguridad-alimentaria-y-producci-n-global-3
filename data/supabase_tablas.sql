-- Dashboard de seguridad alimentaria y producción global
-- Pegar completo en Supabase > SQL Editor y darle Run

create table paises (
  iso3        text primary key,
  pais        text not null,
  continente  text not null,
  subregion   text
);

create table produccion (
  iso3              text references paises(iso3),
  grupo             text not null,
  anio              smallint not null,
  toneladas         numeric not null,
  simbolo           text,
  variacion_atipica smallint default 0,
  primary key (iso3, grupo, anio)
);

create table balance_alimentario (
  iso3      text references paises(iso3),
  grupo     text not null,
  elemento  text not null,
  anio      smallint not null,
  valor     numeric not null,
  unidad    text not null,
  simbolo   text,
  primary key (iso3, grupo, elemento, anio)
);

-- Permisos: cualquiera puede LEER (el dashboard es público); nadie puede modificar desde fuera
alter table paises enable row level security;
alter table produccion enable row level security;
alter table balance_alimentario enable row level security;
create policy "lectura publica" on paises for select using (true);
create policy "lectura publica" on produccion for select using (true);
create policy "lectura publica" on balance_alimentario for select using (true);
