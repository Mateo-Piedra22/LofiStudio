# LofiStudio - Guía de Configuración

Guía completa para configurar y ejecutar LofiStudio localmente o en producción.

## Inicio Rápido

### Opción 1: Vercel (Más Rápida)
1. Haz clic en el botón "Deploy" o conecta el repositorio de GitHub a Vercel
2. Agrega las variables de entorno en el panel de Vercel
3. Despliega automáticamente

### Opción 2: Desarrollo Local
1. Instala dependencias: `npm install` o `bun install`
2. Crea archivo `.env.local` con las claves API
3. Ejecuta: `npm run dev` o `bun dev`
4. Abre http://localhost:3000

## Configuración de Variables de Entorno

Necesitas tres claves API (todas gratuitas):

### YOUTUBE_API_KEY

**Por qué es necesaria**: Buscar y reproducir música lofi desde YouTube

**Pasos de configuración**:
1. Ve a https://console.cloud.google.com/
2. Crea un nuevo proyecto o selecciona uno existente
3. Haz clic en "Habilitar APIs y Servicios"
4. Busca "YouTube Data API v3"
5. Haz clic en "Habilitar"
6. Ve a la pestaña "Credenciales"
7. Haz clic en "Crear Credenciales" → "Clave API"
8. Copia la clave API
9. (Opcional) Restringe la clave solo a YouTube Data API v3

**Límites del tier gratuito**: 10,000 unidades de cuota/día (suficiente para ~500 búsquedas)

### WEATHER_API_KEY

**Por qué es necesaria**: Mostrar el clima en tiempo real en el widget

**Pasos de configuración**:
1. Ve a https://openweathermap.org/
2. Regístrate para obtener una cuenta gratuita
3. Verifica tu email
4. Ve a https://home.openweathermap.org/api_keys
5. Copia la "Clave" (puede tardar 10 minutos en activarse)

**Límites del tier gratuito**: 60 llamadas/minuto, 1,000,000 llamadas/mes

### GIPHY_API_KEY

**Por qué es necesaria**: Mostrar GIFs de estado de ánimo en el widget

**Pasos de configuración**:
1. Ve a https://developers.giphy.com/
2. Regístrate o inicia sesión
3. Haz clic en "Crear una App"
4. Elige la opción "API"
5. Completa el nombre y descripción de la app
6. Acepta los términos y crea
7. Copia la clave API

**Límites del tier gratuito**: 42 llamadas API/hora por IP

## Agregar Variables de Entorno

### En el Panel de Vercel:
1. Ve a la configuración de tu proyecto
2. Haz clic en "Variables de Entorno"
3. Agrega cada clave:
   - Nombre: `YOUTUBE_API_KEY`, Valor: `tu_clave_aquí`
   - Nombre: `WEATHER_API_KEY`, Valor: `tu_clave_aquí`
   - Nombre: `GIPHY_API_KEY`, Valor: `tu_clave_aquí`
4. Vuelve a desplegar para que los cambios surtan efecto

### Para Desarrollo Local:
Crea `.env.local` en la raíz del proyecto:

```env
YOUTUBE_API_KEY=tu_clave_api_de_youtube_aquí
WEATHER_API_KEY=tu_clave_api_de_openweather_aquí
GIPHY_API_KEY=tu_clave_api_de_giphy_aquí
```

**Importante**: ¡Nunca subas `.env.local` a git!

## Lista de Verificación para la Primera Ejecución

Después de desplegar/ejecutar localmente:

1. **Permitir Notificaciones**
   - Haz clic en "Permitir" cuando el navegador pida permiso para notificaciones
   - Requerido para alertas del temporizador Pomodoro

2. **Probar el Reproductor de Música**
   - Busca "lofi hip hop"
   - Haz clic en un resultado para agregar a la lista de reproducción
   - Presiona espacio para reproducir/pausar

3. **Establecer Ubicación del Clima**
   - Haz clic en el widget del clima
   - Ingresa el nombre de tu ciudad
   - O permite el acceso a la ubicación para detección automática

4. **Explorar Funciones**
   - Presiona `Shift + ?` para ver todos los atajos de teclado
   - Prueba diferentes presets de widgets
   - Inicia una sesión Pomodoro
   - Crea una tarea

## Solución de Problemas

### Error "API key no configurada"
- **Solución**: Asegúrate de que las variables de entorno estén configuradas correctamente
- Para Vercel: Verifica configuración del proyecto → Variables de Entorno
- Para local: Verifica que `.env.local` exista y tenga las claves correctas
- Reinicia el servidor de desarrollo después de agregar variables de entorno

### El clima no carga
- **Problema**: Clave API aún no activada
- **Solución**: Espera 10 minutos después de crear la cuenta de OpenWeather
- Intenta nuevamente después de que se complete la activación

### Los videos de YouTube no se reproducen
- **Problema**: Cuota de API excedida
- **Solución**: La API de YouTube tiene límites diarios
- Espera 24 horas para que se reinicie la cuota
- O crea un nuevo proyecto de Google Cloud con una nueva clave API

### Los GIFs no cargan
- **Problema**: Límite de tasa de Giphy (42/hora por IP)
- **Solución**: Espera una hora o usa una red diferente

### Las notificaciones no funcionan
- **Solución**: 
  - Verifica los permisos del navegador para notificaciones
  - Habilita las notificaciones en la configuración del sitio
  - Prueba con un navegador diferente si los problemas persisten

### Errores de localStorage
- **Solución**: 
  - Limpia el caché del navegador y localStorage
  - Verifica si localStorage está habilitado en el navegador
  - Prueba en modo incógnito para probar

## Optimización del Rendimiento

### Para Producción:
1. Habilita el caché en tu plataforma de alojamiento
2. Usa CDN para activos estáticos
3. Habilita compresión (gzip/brotli)
4. Monitorea el uso de la API para mantenerte dentro de los límites

### Para Mejor UX:
1. Usa presets de widgets para configuración más rápida
2. Exporta datos regularmente como respaldo
3. Cierra widgets no utilizados para mejorar el rendimiento
4. Limpia tareas y registros antiguos periódicamente

## Notas de Seguridad

- Las claves API son solo del lado del servidor (no expuestas al cliente)
- Todos los datos se almacenan localmente en el navegador
- No se envían datos del usuario a servicios externos excepto llamadas API
- Seguro para usar en WiFi público

## Configuración Móvil

La aplicación funciona genial en móviles:
1. Agrega a la pantalla de inicio para una experiencia tipo app
2. Usa gestos táctiles para navegación
3. Menú hamburguesa para todas las opciones
4. Diseños optimizados para pantallas pequeñas

## Análisis de Costos

Ejecutar LofiStudio es **completamente GRATIS**:
- API de YouTube: Tier gratuito (10k unidades/día)
- API de OpenWeather: Tier gratuito (1M llamadas/mes)
- API de Giphy: Tier gratuito (42 llamadas/hora)
- Alojamiento en Vercel: Tier gratuito (100GB de ancho de banda)
- Sin costos de base de datos (solo localStorage)

**¡Cero costos mensuales para uso personal!**

## Próximos Pasos

Después de la configuración:
1. Personaliza tu diseño de widgets
2. Crea tu primera tarea
3. Inicia una sesión Pomodoro
4. Construye tu lista de reproducción de música
5. Explora los atajos de teclado

¿Necesitas ayuda? Consulta el README.md principal para documentación detallada.

---

¡Feliz productividad!
