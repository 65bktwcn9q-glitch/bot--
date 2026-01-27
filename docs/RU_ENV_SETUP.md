# Как заполнить .env (без размышлений)

## 1) Скопируй шаблоны
```bash
cp apps/api/.env.fill apps/api/.env
cp apps/web/.env.fill apps/web/.env
```

## 2) Открой и заполни
### `apps/api/.env`
Заполни **только эти строки**:
```
TELEGRAM_BOT_TOKEN=
DEEPSEEK_API_KEY=
PAYMENT_WEBHOOK_SECRET=
CLIENT_ORIGIN=
```

Если платежи не нужны — остальные оставь пустыми.

### `apps/web/.env`
Заполни:
```
VITE_API_URL=
```

## 3) Готово
После этого можно запускать.
