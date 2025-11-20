# Requisitos del Proyecto y Stack Tecnológico

## Tecnologías Principales
- **Framework Frontend**: Next.js 14 (App Router)
- **Lenguaje**: TypeScript
- **Estilos**: Tailwind CSS v3 con `tailwindcss-animate`
- **Componentes UI**: Radix UI (vía shadcn/ui)
- **Animaciones**: Framer Motion

## Backend y Base de Datos (Serverless)
- **Base de Datos**: Neon (Serverless Postgres)
- **ORM**: Drizzle ORM (Conecta Next.js con Neon)
- **Autenticación**: NextAuth.js (v5 beta) con Proveedor de Google

## Plataforma de Despliegue
- **Vercel**: Alojamiento para Frontend y Funciones Serverless

## Prerequisitos
- **Node.js**: v18.17.0 o superior
- **Gestor de Paquetes**: npm (v9+) o pnpm
- **Vercel CLI**: (Opcional, para pruebas locales de despliegue) `npm i -g vercel`

## APIs Externas
- **Google Cloud Console**: Para OAuth 2.0 (Login)
- **YouTube Data API v3**: Para el Reproductor de Música
- **OpenWeatherMap API**: Para el Widget del Clima
- **Giphy API**: Para el Widget GIF
