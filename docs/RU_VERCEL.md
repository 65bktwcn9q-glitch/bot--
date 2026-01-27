# Vercel: деплой фронта и 404

## Почему 404
В Vite/React это SPA. Если нет правила **rewrite**, Vercel не знает, что
любой путь (например `/training`) должен вести на `index.html`.

## Быстрый фикс (уже добавлен в проект)
В корне есть `vercel.json`:
```json
{
  "framework": "vite",
  "buildCommand": "npm --workspace apps/web run build",
  "outputDirectory": "apps/web/dist",
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

Это заставляет Vercel отдавать `index.html` на всех путях.

## Как деплоить
1. Залей репозиторий на GitHub.
2. В Vercel нажми **New Project** → выбери репозиторий.
3. Ничего не меняй — `vercel.json` уже задаёт build и папку `dist`.
4. Нажми Deploy.

## Важно
Vercel хостит **только фронт**. Бэкенд (API/DB) нужен отдельно.
Если API не развернут — кнопки и задания будут ломаться.
