# Boomerang Management — Módulo de gestión de pagos

Aplicación de gestión de pagos por contenedor. Fase 1: login + contenedor activo + asignación de cobrador.

## Stack
- Next.js 14 (App Router) + TypeScript
- Tailwind CSS
- PostgreSQL + Prisma
- NextAuth (usuario/contraseña)

## 1. Poner en marcha en local

1. Instala dependencias:
   ```
   npm install
   ```
2. Crea una base de datos Postgres. La forma más rápida y gratuita para empezar: [neon.tech](https://neon.tech) o [supabase.com](https://supabase.com) (crea el proyecto y copia la "connection string").
3. Copia `.env.example` a `.env` y rellena:
   - `DATABASE_URL` con la connection string de tu base de datos.
   - `NEXTAUTH_SECRET` — genera uno con `openssl rand -base64 32`.
4. Crea las tablas y carga los datos iniciales (usuario admin, 3 cobradores, contenedor 9):
   ```
   npx prisma migrate dev --name init
   npm run db:seed
   ```
5. Arranca la app:
   ```
   npm run dev
   ```
6. Entra en `http://localhost:3000` con:
   - Usuario: `admin`
   - Contraseña: `admin123`

   ⚠️ Cambia esta contraseña antes de usar la app con datos reales (lo haremos en el módulo de usuarios).

## 2. Desplegar en la nube

1. Sube este proyecto a un repositorio de GitHub.
2. Entra en [vercel.com](https://vercel.com), conecta tu cuenta de GitHub e importa el repositorio.
3. En "Environment Variables" de Vercel añade las mismas variables del `.env` (`DATABASE_URL`, `NEXTAUTH_SECRET`, y `NEXTAUTH_URL` con la URL final que te dé Vercel).
4. Despliega. Vercel instala dependencias y compila automáticamente.
5. Ejecuta las migraciones contra la base de datos de producción una vez (desde tu ordenador, apuntando el `DATABASE_URL` a la base de producción):
   ```
   npx prisma migrate deploy
   npm run db:seed
   ```

## Qué falta por hacer (próximos pasos)
- Importación real del extracto de Revolut (CSV/XLSX).
- Pantalla de conciliación (ingresos sin identificar / avisos sin ingreso).
- Integración de WhatsApp Business API para avisos y confirmaciones.
- Módulo de usuarios (alta/baja, roles).
- Generación de factura al completar el 100% del contenedor.

## Datos de ejemplo cargados por el seed
- Contenedor 9 · MSKU9395463 · Total factura 93.600 $
- Cobradores: Ana, Miguel, Carlos
- 5 pagos de ejemplo, 2 de ellos sin cobrador asignado (para probar la asignación rápida)
