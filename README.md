# GTA SA Multiplayer Launcher (Tauri + React)

## Project structure
```
.
├── public/
│   ├── servers.json
│   ├── server-bg.svg
│   └── updates/
│       └── example/
│           ├── manifest.json
│           └── news.json
├── scripts/
│   └── generate-manifest.js
├── src/
│   ├── components/
│   │   ├── ServerCard.tsx
│   │   ├── Sidebar.tsx
│   │   ├── Toasts.tsx
│   │   ├── TopBar.tsx
│   │   └── UpdateModal.tsx
│   ├── i18n/
│   │   ├── locales/
│   │   │   ├── en.json
│   │   │   ├── ru.json
│   │   │   └── ua.json
│   │   └── index.ts
│   ├── pages/
│   │   ├── ServerDetails.tsx
│   │   ├── ServerList.tsx
│   │   └── Settings.tsx
│   ├── store/
│   │   └── launcherStore.ts
│   ├── styles/
│   │   ├── index.css
│   │   └── theme.css
│   ├── types/
│   │   └── server.ts
│   ├── App.tsx
│   └── main.tsx
├── src-tauri/
│   ├── src/
│   │   └── main.rs
│   ├── Cargo.toml
│   ├── build.rs
│   └── tauri.conf.json
├── index.html
├── package.json
├── postcss.config.cjs
├── tailwind.config.ts
├── tsconfig.json
└── vite.config.ts
```

## Dev запуск
```bash
npm install
npm run tauri dev
```

## Build
```bash
npm run tauri build
```

## Setup.exe (Windows installer)
Tauri will generate Windows installers with NSIS/MSI. After `npm run tauri build`, find artifacts here:
```
src-tauri/target/release/bundle/nsis/*.exe
src-tauri/target/release/bundle/msi/*.msi
```

## Сборка всё + EXE для запуска и Setup
```bash
npm install
npm run build:win
```

После сборки:
```
EXE (launcher):
src-tauri/target/release/samp-launcher.exe

Setup (installer):
src-tauri/target/release/bundle/nsis/*.exe
src-tauri/target/release/bundle/msi/*.msi
```

## Где менять `servers.json`
Добавляйте новые сервера в `public/servers.json` — UI автоматически подхватит список без правок кода.

## Структура обновлений на хостинге
```
/manifest.json
/files/...
/news.json
```

### Пример `manifest.json`
```json
{
  "version": "1.0.0",
  "critical": false,
  "files": [
    { "path": "models/aurora_pack.img", "size": 1843200, "sha256": "..." }
  ]
}
```

### Пример `news.json`
```json
[
  {
    "id": "update-01",
    "title": "New economy season",
    "date": "2024-07-12",
    "summary": "Balance pass for jobs, new business tiers, and fresh starter packs.",
    "url": "https://example.com/news/1"
  }
]
```

## Генерация манифеста
```bash
node scripts/generate-manifest.js /path/to/updates
```

## Деплой обновлений
1. Сгенерируйте `manifest.json` для папки `updates`.
2. Залейте `manifest.json`, `news.json`, и папку `files/` на любой static hosting (S3, Cloudflare R2, GitHub Pages).
3. Укажите URL на корень апдейтов в `servers.json` в поле `updatesBaseUrl`.
