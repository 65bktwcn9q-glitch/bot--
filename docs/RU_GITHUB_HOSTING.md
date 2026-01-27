# Как залить на GitHub и что с хостингом

## 1) Залить проект на GitHub (очень коротко)
1. Создай репозиторий на https://github.com (кнопка **New repository**).
2. В терминале в папке проекта:
   ```bash
   git remote add origin https://github.com/ТВОЙ_НИК/telegram-german-webapp.git
   git push -u origin main
   ```
Готово — код на GitHub.

---

## 2) Бесплатный хостинг от GitHub — что это значит?
Да, **GitHub Pages бесплатный**, но это **только статические сайты**.
То есть он умеет отдавать **только фронтенд** (HTML/CSS/JS).

**Он НЕ может** запускать:
- Node.js/Express сервер
- Prisma/SQLite
- Webhooks, платежи, DeepSeek API

Итого: GitHub Pages = только фронт.

---

## 3) Что делать, если нужен сервер бесплатно?
Если у тебя нет хостинга и денег — используй запуск на своём ПК и
**Cloudflare Tunnel**, это даст публичную ссылку бесплатно:

```bash
./scripts/one-command.sh
```

Ссылка появится в логах:
```bash
docker compose logs -f tunnel
```

Это самый простой вариант без VPS.
