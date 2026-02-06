# 🎵 LofiStudio

**LofiStudio** is an immersive, customizable productivity workspace designed to help you focus, relax, or work efficiently. It combines high-quality ambient sounds, real-time widgets, and a dynamic 3D glassmorphic interface into a unified "Studio" experience.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Tailwind](https://img.shields.io/badge/Tailwind-CSS-cyan)

## ✨ What's New in V2?

The new **Studio V2** architecture brings significant improvements:

- **Real-time Data Integrations**: Live Weather (OpenWeather/Open-Meteo), World Time, and dynamic Radio Browser.
- **Robust Audio Engine**: Gapless playback, bandwidth optimization (metadata only), and error recovery.
- **Responsive Layouts**: Smart 2x3 and 3x3 grids that adapt seamlessly from desktop to mobile.
- **Widgets Ecosystem**: A growing collection of productivity tools (Pomodoro, Tasks, Dictionary, Quotes).
- **Vercel Serverless Optimized**: Stateless architecture with selective persistence.

---

## 📚 Documentation

Detailed technical documentation is available in the `docs/` directory:

- [**🏗️ Architecture Overview**](docs/ARCHITECTURE.md): Deep dive into the V2 system, providers, and state management.
- [**🧩 Widget System**](docs/WIDGET_SYSTEM.md): How the grid works, creating new widgets, and layout persistence.
- [**🔊 Audio Engine**](docs/AUDIO_ENGINE.md): Explanation of the Web Audio API implementation and mixing logic.
- [**🌍 Real Data & APIs**](docs/REAL_DATA.md): List of external services, environment variables, and integration details.

---

## 🚀 Getting Started

### Prerequisites

- **Node.js 18+**
- **npm** or **pnpm**
- (Optional) **PostgreSQL** (Neon) for cloud sync features.

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/LofiStudio.git
   cd LofiStudio
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   Create a `.env.local` file based on `.env.example`:
   ```env
   # Essential APIs
   UNSPLASH_ACCESS_KEY=your_unsplash_key
   OPENWEATHER_API_KEY=your_weather_key
   YOUTUBE_API_KEY=your_youtube_key
   ```
   *See [Real Data Docs](docs/REAL_DATA.md) for full configuration details.*

4. **Run Development Server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to view the studio.

---

## 🛠️ Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS, Framer Motion, Radix UI (Primitives)
- **State Management**: Zustand
- **Database**: Drizzle ORM + PostgreSQL
- **Authentication**: NextAuth.js

---

## 📂 Project Structure

```
LofiStudio/
├── app/
│   ├── components/
│   │   ├── StudioV2/       # Core layout and logic
│   │   ├── WidgetsV2/      # Individual widget components
│   │   ├── WidgetGrid/     # Drag-and-drop system
│   │   └── SettingsV2/     # Configuration panels
│   ├── studio/             # Main application route
│   └── api/                # Server-side API proxies
├── lib/
│   ├── audio/              # AudioManager engine
│   ├── stores/             # Global Zustand stores
│   └── constants/          # Static configuration
├── docs/                   # Technical documentation
└── public/                 # Static assets (sounds, icons)
```

---

## 🤝 Contributing

Contributions are welcome! Please read our architecture guidelines in `docs/` before submitting a Pull Request.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

**Made with ❤️ for focus and relaxation.**
