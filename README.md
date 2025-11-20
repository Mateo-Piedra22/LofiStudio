# 🎵 LofiStudio

**LofiStudio** es un espacio de trabajo productivo y personalizable, diseñado para enfocarte con música lofi, widgets inteligentes y un ambiente visual inmersivo. Perfecto para estudiar, trabajar o simplemente relajarte.

---

## ✨ Características Principales

### 🎮 **Sistema de Widgets (Grid 2x3 y 3x3)**
- **Posiciones fijas dentro del grid**: 3 columnas por modo, sin salir de la cuadrícula
- **Reordenamiento por drag & drop**: Al soltar sobre otra tarjeta, se intercambian posiciones
- **Capacidad**: 6 widgets en `2x3` y 9 en `3x3`; aviso centrado cuando se alcanza el límite
- **Sin scroll en la página principal**: El espacio manejable es el del grid seleccionado
- **Alturas responsivas por columna**: La suma de alturas + separaciones llena el alto total de la columna
- **Modo libre (Premium)**: Botón visible en la barra superior, no clickeable; documentación abajo

### 🎧 **Reproductor de Música Inteligente**
- **Búsqueda de YouTube**: Encuentra y reproduce cualquier canción lofi
- **Plegable/Desplegable**: Mini reproductor con controles esenciales o vista completa
- **Listas de Reproducción**: Crea y gestiona tus propias playlists
- **Controles Avanzados**: Shuffle, repeat, skip, y control de volumen
- **Integración con Presets**: Cada preset carga una playlist curada automáticamente

### 🎨 **Temas Adaptativos**
- **Modo Claro/Oscuro** y **Automático**
- **Glassmorphism** tokenizado con opacidad persistente (`--glass-opacity`)
- Persistencia de preferencias

### 🧩 **Widgets Disponibles**

#### 🕐 **Reloj**
- Hora en tiempo real con diseño minimalista
- Adaptable a cualquier tamaño

#### ⛅ **Clima**
- Pronóstico del tiempo actual
- Búsqueda de ciudades
- Datos de temperatura, humedad y condiciones

#### 🎬 **GIF Animado**
- GIFs de categorías lofi, naturaleza, espacio, y más
- Se actualiza automáticamente

#### ✅ **Gestor de Tareas**
- Crea, completa y elimina tareas
- Asigna fecha y hora, y color por tarea
- Editor inline con lápiz, y completar desde Calendar modal
- Persistencia en localStorage y cloud (opcional)

#### 📝 **Notas Rápidas**
- Editor de texto simple
- Guardado automático

#### 💬 **Citas Inspiradoras**
- Citas motivacionales, de paz y enfoque
- **Multilingüe**: Español e Inglés
- Proxy local `/api/quote` con fallback robusto
- Actualización manual o automática

#### 📅 **Calendario**
- Vista mensual
- Dots de color por día según tareas (uno por color)
- Modal con todas las tareas del día ordenadas por hora
- Completar/editar dentro del modal, cierre con X o clic fuera

#### 🌬️ **Ejercicios de Respiración**
- Patrones guiados (4-7-8, Box Breathing, etc.)
- Animaciones visuales
- Persistencia del patrón seleccionado

#### 📖 **Diccionario**
- Búsqueda rápida de definiciones en inglés
- API gratuita de diccionario

#### ⏱️ **Temporizador Pomodoro**
- Sesiones personalizables de trabajo y descanso
- Notificaciones visuales y sonoras
- Estadísticas de sesiones completadas
- **Ahora movible y redimensionable como cualquier widget**

---

## 🎯 **Presets Inteligentes**

LofiStudio incluye **6 presets predefinidos** que configuran automáticamente tu espacio de trabajo:

| Preset | Descripción | Widgets Incluidos | Música |
|--------|-------------|-------------------|---------|
| **Minimalist** | Limpio y esencial | Reloj, Citas | Lofi Girl Radio |
| **Deep Focus** | Productividad máxima | Tareas, Timer, Notas, Reloj, Clima | Lofi Hip Hop Radio |
| **Chill Vibes** | Ambiente relajado | GIF, Reloj, Clima, Citas | Cozy Rain |
| **Creative Flow** | Inspiración y creatividad | Notas, GIF, Citas, Timer | Space Journey |
| **Zen Mode** | Mínimas distracciones | Timer, Respiración | Lofi Girl Radio |
| **Command Center** | Todas las herramientas | Reloj, Clima, Calendario, Tareas, Notas, Timer | Lofi Hip Hop Radio |

**Filosofía**: Cada preset te ofrece un punto de partida inteligente, pero todas tus personalizaciones posteriores se guardan automáticamente.

---

## 🧱 **Sistemas de Grid**

- **Modos disponibles**: `2x3` y `3x3`.
- **Capacidad**: `2x3` admite 6 widgets; `3x3` admite 9.
- **Límites de arrastre**: Los widgets no pueden salir del área del grid.
- **Intercambio de posiciones**: Si se suelta un widget en la posición de otro, se intercambian.
- **Altura por columna**:
  - Cada columna tiene un alto total fijo según el modo elegido.
  - La suma de alturas de los widgets de esa columna se ajusta automáticamente para rellenar exactamente ese alto.
  - Ejemplos válidos: `3 filas` en `3x3`, `2 + 1` filas, o `1 + 1 + 1` filas según los widgets.
- **Widgets de varias filas**: Algunos widgets ocupan más de una fila (p. ej., Tareas). El sistema ajusta el resto para mantener la suma total.

### 🏷️ Modo libre (Premium)
- **Qué es**: Edición libre de tamaño y posición sin respetar la cuadrícula.
- **Estado actual**: Visible como un botón deshabilitado en la barra superior.
- **Detalles**:
  - Permite ajustar ancho y alto por widget.
  - Mantiene separación mínima entre widgets y bordes, sin superposiciones.
  - Sin scroll global; el área de trabajo sigue siendo la misma.
  - No editable desde la UI en esta versión; planeado como característica premium.

---

## 🛠️ **Tecnologías Utilizadas**

### **Frontend**
- **Next.js 14** (App Router)
- **React 18**
- **TypeScript**
- **Tailwind CSS** con diseño adaptativo
- **Shadcn/UI** para componentes base
- **Framer Motion** para animaciones fluidas
- **React Grid Layout** para el sistema drag & drop

### **Backend**
- **Next.js API Routes**
- **NextAuth v5** (Google) con scopes dinámicos según Integrations
- **Drizzle ORM** + **Neon Database** (PostgreSQL serverless)

### **APIs Externas** (Todas gratuitas)
- **YouTube Data API v3** (reproduce música lofi)
- **OpenWeather API** (pronóstico del tiempo)
- **Giphy API** (GIFs animados)
- **Free Dictionary API** (definiciones)
- **DiceBear API** (avatares de usuario)

### **Herramientas de Desarrollo**
- **ESLint** + **Prettier**
- **Git** para control de versiones

---

## 🚀 **Instalación y Configuración**

### **1. Requisitos Previos**
- **Node.js 18+** y **npm** (o **pnpm**/**yarn**)
- Cuenta en **Neon** (base de datos PostgreSQL serverless, gratuita)
- Cuenta de **Google Cloud Console** (para autenticación con Google OAuth)
- API Keys para:
  - YouTube Data API v3
  - OpenWeather API
  - Giphy API

### **2. Clonar el Repositorio**
```bash
git clone https://github.com/tu-usuario/LofiStudio.git
cd LofiStudio
```

### **3. Instalar Dependencias**
```bash
npm install
```

### **4. Configurar Variables de Entorno**
Crea un archivo `.env.local` en la raíz del proyecto con el siguiente contenido:

```env
# Database (Neon PostgreSQL)
DATABASE_URL=postgresql://usuario:contraseC3%B1a@endpoint.neon.tech/dbname?sslmode=require

# NextAuth
AUTH_SECRET=tu_secreto_aleatorio_muy_largo_y_seguro
NEXTAUTH_URL=http://localhost:3000

# Google OAuth
AUTH_GOOGLE_ID=tu_google_client_id.apps.googleusercontent.com
AUTH_GOOGLE_SECRET=tu_google_client_secret

# YouTube API
YOUTUBE_API_KEY=tu_youtube_api_key

# OpenWeather API
WEATHER_API_KEY=tu_openweather_api_key

# Giphy API
GIPHY_API_KEY=tu_giphy_api_key
```

**Notas**:
- Para `AUTH_SECRET`, genera un string aleatorio con: `openssl rand -base64 32`
- Consulta `SETUP_GUIDE.md` para obtener todas las API keys paso a paso

### **5. Configurar la Base de Datos**
```bash
# (Opcional) Generar migraciones versionadas
npm run db:generate

# Aplicar migraciones (si usas drizzle-kit)
npm run db:push

# Abrir Drizzle Studio para ver la BD
npm run db:studio
```
Con `DATABASE_URL` configurada en Vercel, la app asegura automáticamente las tablas esenciales en el primer arranque (create if not exists).

### **6. Ejecutar en Desarrollo**
```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

### **7. Build para Producción**
```bash
npm run build
npm start
```

---

## 📂 **Estructura del Proyecto**

```
LofiStudio/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes (YouTube, Weather, Giphy, etc.)
│   ├── components/               # Componentes de React
│   │   ├── Background/           # Fondos 3D y videos
│   │   ├── Player/               # Reproductor de música
│   │   ├── Timer/                # Temporizador Pomodoro
│   │   ├── Widgets/              # Todos los widgets (Reloj, Clima, etc.)
│   │   ├── Settings/             # Panel de configuración
│   │   ├── Tasks/                # Gestor de tareas
│   │   └── ...
│   ├── globals.css               # Estilos globales y temas
│   ├── layout.tsx                # Layout raíz con providers
│   └── page.tsx                  # Página principal con grid layout
├── lib/
│   ├── hooks/                    # Custom hooks (useWidgets, useLocalStorage, etc.)
│   ├── types/                    # Definiciones de TypeScript
│   └── utils.ts                  # Utilidades (cn, formatTime, etc.)
├── db/
│   └── schema.ts                 # Esquema de la base de datos (Drizzle)
├── public/                       # Archivos estáticos
├── .env.local                    # Variables de entorno (NO incluir en Git)
├── tailwind.config.ts            # Configuración de Tailwind
├── package.json
├── README.md
└── ...
```

---

## 🎨 **Atajos de Teclado**

| Atajo | Acción |
|-------|--------|
| `Ctrl + E` | Activar/Desactivar modo de edición de layout |
| `Ctrl + ,` | Abrir configuración |
| `Ctrl + S` | Abrir estadísticas |
| `Ctrl + L` | Abrir registro de actividades |
| `Ctrl + K` | Abrir Command Palette |
| `Shift + ?` | Mostrar atajos de teclado |
| `Alt + Z` | Activar/Desactivar modo Zen (oculta UI, widgets visibles) |
| `Esc` | Cerrar modales/Salir de modo Zen |

---

## 🔧 **Personalización Avanzada**

### **Agregar Nuevos Widgets**
1. Crea tu componente en `app/components/Widgets/TuWidget.tsx`
2. Añade el tipo en `lib/types/index.ts` (`WidgetConfig`)
3. Regístralo en `app/components/Widgets/WidgetManager.tsx`
4. Renderízalo en `app/page.tsx` dentro del grid

### **Modificar Temas**
Edita las variables CSS en `app/globals.css`:
- `:root` para modo claro
- `.dark` para modo oscuro

### **Añadir Fondos Personalizados**
Modifica `app/components/Background/index.tsx` para incluir nuevas escenas 3D o videos.
También puedes cargar imágenes desde Unsplash sin API key desde el selector de fondos.

---

## 📝 **Scripts Disponibles**

```bash
npm run dev          # Desarrollo (http://localhost:3000)
npm run build        # Build de producción
npm start            # Ejecutar build
npm run lint         # Linter (ESLint)
npm run db:generate  # Generar migraciones de BD
npm run db:migrate   # Aplicar migraciones
npm run db:studio    # Abrir Drizzle Studio
```

---

## 🌐 **Despliegue**

### **Vercel (Recomendado)**
1. Conecta tu repositorio de GitHub a [Vercel](https://vercel.com)
2. Configura las variables de entorno en el panel de Vercel
3. Despliega automáticamente con cada push a `main`

Consulta `DEPLOY.md` para instrucciones detalladas.

---

## 🐛 **Solución de Problemas**

<details>
<summary><strong>Error: "Cannot find module '@/lib/hooks/useLocalStorage'"</strong></summary>

Asegúrate de haber ejecutado `npm install` y que el archivo exista en la ruta correcta.
</details>

<details>
<summary><strong>El tema no cambia</strong></summary>

Verifica que el `ThemeProvider` esté correctamente configurado en `app/components/Providers.tsx`. El tema se guarda en `localStorage` bajo la clave `theme`.
</details>

<details>
<summary><strong>Los widgets no se guardan</strong></summary>

Los widgets se guardan en `localStorage`. Asegúrate de no estar en modo incógnito y que tu navegador permita `localStorage`.
</details>

<details>
<summary><strong>El reproductor no carga videos</strong></summary>

Verifica que tu `YOUTUBE_API_KEY` sea válida y que no hayas excedido el límite de cuota diaria de la API de YouTube.
</details>

---

## 🤝 **Contribuciones**

¡Las contribuciones son bienvenidas! Si encuentras un bug o tienes una idea para mejorar LofiStudio:

1. Haz un fork del repositorio
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Haz commit de tus cambios (`git commit -m 'Añadir nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

---

## 📄 **Licencia**

Este proyecto está bajo la licencia MIT. Consulta el archivo `LICENSE` para más detalles.

---

## 🙏 **Agradecimientos**

- **Lofi Girl** por la inspiración musical
- **Next.js** y **Vercel** por la increíble plataforma
- **Shadcn/UI** por los componentes UI base
- **React Grid Layout** por el sistema de drag & drop
- Todas las APIs gratuitas que hacen posible este proyecto

---

## 📧 **Contacto**

¿Preguntas? ¿Sugerencias? Abre un [Issue](https://github.com/tu-usuario/LofiStudio/issues) en GitHub.

---

**Hecho con ❤️ y ☕ para ayudarte a enfocarte mejor.**
## 🧯 **Páginas de Error**

- 404 "Página no encontrada" con estética LofiStudio y retorno rápido al inicio
- Página de error global con botón de reintento y salida al inicio
- Archivos: `app/not-found.tsx`, `app/error.tsx`

## 🔌 **PWA y Offline**
- Registro automático de Service Worker (`/sw.js`).
- Estrategias de caché:
  - `NetworkFirst` para documentos.
  - `Stale-While-Revalidate` para `/_next/static`, imágenes internas y Unsplash.
  - Precarga de `/`, `manifest.json` e `icon.png`.

## ☁️ **APIs y Fallbacks**
- Clima: usa OpenWeather si `WEATHER_API_KEY` está configurada; si no, fallback a Open‑Meteo con geocoding gratuito y mapeo WMO a iconos y descripciones.
- Citas: proxy local `/api/quote` con timeout y fallback.
