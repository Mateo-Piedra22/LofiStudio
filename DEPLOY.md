# Instrucciones de Despliegue en Vercel con Neon DB

## Resumen
Este proyecto está listo para desplegarse en Vercel. La base de datos Neon está configurada opcionalmente - la aplicación funciona perfectamente sin ella usando localStorage.

## Despliegue Rápido en Vercel

### Paso 1: Preparar el Repositorio
```bash
git init
git add .
git commit -m "Initial commit - LofiStudio"
git branch -M main
git remote add origin tu-repositorio-github
git push -u origin main
```

### Paso 2: Configurar en Vercel
1. Ve a [vercel.com](https://vercel.com) e inicia sesión
2. Click en "New Project"
3. Importa tu repositorio de GitHub
4. Configura las variables de entorno (ver sección abajo)
5. Click en "Deploy"

### Paso 3: Variables de Entorno Requeridas

**Mínimas para funcionamiento bás ico** (sin autenticación persistente):
```env
AUTH_SECRET=genera-un-secret-aleatorio-aqui
AUTH_GOOGLE_ID=tu-google-client-id
AUTH_GOOGLE_SECRET=tu-google-client-secret
YOUTUBE_API_KEY=tu-youtube-api-key
WEATHER_API_KEY=tu-weather-api-key
GIPHY_API_KEY=tu-giphy-api-key
```

**Opcional - Para autenticación persistente con Neon DB**:
```env
DATABASE_URL=postgresql://usuario:password@ep-xxx.neon.tech/dbname?sslmode=require
```

## Configurar Google OAuth

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto
3. Habilita "Google+ API"
4. Ir a "Credentials" → "Create Credentials" → "OAuth Client ID"
5. Tipo: Web application
6. Authorized redirect URIs:
   - `https://tu-dominio.vercel.app/api/auth/callback/google`
   - `http://localhost:3000/api/auth/callback/google` (para desarrollo)
7. Copia Client ID y Client Secret

## Configurar Neon DB (Opcional)

### ¿Cuándo necesitas Neon DB?
- **NO necesitas DB** si solo quieres que la app funcione localmente en el navegador (usa localStorage)
- **SÍ necesitas DB** si quieres:
  - Autenticación persistente entre dispositivos
  - Sincronización de datos
  - Almacenamiento de perfil de usuario

### Cómo configurar Neon:

1. **Crear cuenta en Neon**:
   - Ve a [neon.tech](https://neon.tech)
   - Registrate gratis
   - Crea un nuevo proyecto

2. **Obtener credenciales**:
   - En el dashboard de Neon, copia la "Connection String"
   - Formato: `postgres://usuario:password@ep-xxx.neon.tech/dbname?sslmode=require`

3. **Agregar a Vercel**:
   - En tu proyecto de Vercel → Settings → Environment Variables
   - Agrega `DATABASE_URL` con el valor de Neon

4. **Ejecutar migraciones**:
   ```bash
   # Descomentar en auth.ts las líneas del adaptador de Drizzle
   # Líneas 3-4 y línea 7
   
   # Generar migraciones
   npm run db:generate
   
   # Aplicar a Neon
   npm run db:push
   ```

5. **Verificar tablas**:
   - Las tablas se crearán automáticamente: `user`, `account`, `session`, `verificationToken`, `task`, `settings`

## Estado Actual del Proyecto

### ✅ Completado y Listo
- ✅ Autenticación de Google (NextAuth)
- ✅ Widgets pre-configurados (Minimal, Productivo, Chill)
- ✅ UI/UX pulido con glassmorphism y animaciones
- ✅ Build exitoso
- ✅ Documentación completa en español

### 📝 Configuración Pendiente (Usuario)
- Obtener claves API de Google, YouTube, Weather, Giphy
- Crear proyecto en Vercel
- (Opcional) Crear base de datos en Neon
- (Opcional) Descomentar adaptador de Drizzle en `auth.ts` si usas Neon

## Estructura de DB Neon (Opcional)

Si decides usar Neon, las tablas se crean automáticamente con este esquema:

### Tablas de NextAuth:
- `user`: Información del usuario (id, name, email, image)  
- `account`: Cuentas OAuth vinculadas
- `session`: Sesiones activas
- `verificationToken`: Tokens de verificación

### Tablas de la Aplicación:
- `task`: Tareas del usuario
- `settings`: Configuraciones del usuario (tema, duraciones Pomodoro)

## Comandos Útiles

```bash
# Desarrollo local
npm run dev

# Build de producción
npm run build

# Iniciar servidor de producción
npm run start

# Generar migraciones de DB (si usas Neon)
npm run db:generate

# Aplicar migraciones a Neon
npm run db:push

# Abrir Drizzle Studio (visualizar DB)
npm run db:studio
```

## Notas Importantes

1. **Sin DB = Funciona igual**: La app funciona perfectamente sin Neon usando localStorage del navegador
2. **Datos locales**: Si no usas Neon, los datos solo se guardan en el navegador del usuario
3. **Migraciones automáticas**: Cuando uses Neon, ejecuta `npm run db:push` para crear las tablas
4. **Auth sin DB**: NextAuth funciona con sesiones JWT sin base de datos

## Solución de Problemas

### Build falla en Vercel
- Verifica que todas las variables de entorno estén configuradas
- `DATABASE_URL` no es requerida para el build

### Auth no funciona
- Verifica que `AUTH_SECRET` esté configurado
- Verifica las URLs de callback en Google Console

### DB errors
- Si no usas Neon, puedes ignorar warnings sobre `DATABASE_URL`
- Si usas Neon, verifica que la connection string sea correcta

---

**🚀 ¡Tu aplicación está lista para producción!**

Para cualquier duda, consulta:
- `README.md` - Documentación general
- `SETUP_GUIDE.md` - Guía de configuración detallada  
- `REQUIREMENTS.md` - Stack tecnológico
