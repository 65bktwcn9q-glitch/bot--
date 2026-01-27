# Deutsch MiniApp – Telegram Web App zum Deutschlernen

## Überblick
Dieses Projekt ist eine vollständige Telegram Web App (Mini App) zum Lernen der deutschen Sprache. Die App nutzt DeepSeek zur Generierung interaktiver Aufgaben, speichert den Fortschritt in SQLite (Prisma) und bietet eine Admin-Oberfläche zur Monetarisierung, Werbung und Nutzerverwaltung.

**Technologien**
- Frontend: React + TypeScript + Vite
- UI: TailwindCSS + Radix UI (shadcn-inspiriert)
- Backend: Node.js + Express (TypeScript)
- Datenbank: SQLite via Prisma (optional Postgres)
- Integrationen: Telegram WebApp API, DeepSeek API
- Monetarisierung: Telegram Stars, TON, USDT (TON), Portmone, Capitalist

---

## Architektur
```
/workspace/bot--
├─ apps/
│  ├─ web/        # React WebApp + Admin UI
│  └─ api/        # Express API + Prisma + Payment-Proxies
├─ package.json   # Monorepo-Workspaces
└─ README.md
```

**Backend**
- Authentifizierung über Telegram `initData` (HMAC-Validierung).
- API-Endpunkte:
  - `POST /api/generateTask` (DeepSeek-Aufgaben)
  - `POST /api/submitAnswer` (Fortschritt)
  - `GET /api/history` (Statistik)
  - `GET /api/ads` (Werbung)
  - `POST /api/payments/create` (Payment-Init)
  - `POST /api/webhooks/:provider` (Payment-Webhooks)
  - `GET /api/admin/*` (Admin-Funktionen)
- Rate Limiting & Daily Limits (Free vs VIP).

**Frontend**
- Pages: Onboarding, Home, Training, Historie, Settings, Admin.
- Telegram WebApp Features: Theme, MainButton, Haptics.
- Ads: Banner & Fullscreen (Interstitial).

---

## Superschnell-Start (1 Befehl, ohne Nachdenken)
**Voraussetzung:** Docker ist installiert.

```bash
./scripts/one-command.sh
```

Das Script:
- erstellt die `.env` Dateien,
- startet API + Web + Tunnel automatisch,
- erzeugt einen **öffentlichen Link** über Cloudflare Tunnel.

Den öffentlichen Link findest du im Log der `tunnel`-Instanz:
```bash
docker compose logs -f tunnel
```

### Dev-Mode (ohne Telegram & DeepSeek)
Standardmäßig läuft die API im **DEV_MODE**. Du brauchst dann **keine Tokens**,
um die App zu testen.

---

## Lokales Setup (klassisch)
### 1) Abhängigkeiten installieren
```bash
npm install
```

### 2) Backend konfigurieren
```bash
cp apps/api/.env.example apps/api/.env
```
Wichtige Werte:
- `TELEGRAM_BOT_TOKEN`: Bot-Token für `initData`-Validierung
- `DEEPSEEK_API_KEY`: API Key für DeepSeek
- `PAYMENT_WEBHOOK_SECRET`: Secret für Webhook-Schutz

### 3) Datenbank initialisieren
```bash
cd apps/api
npx prisma generate
npx prisma migrate dev --name init
```

### 4) Frontend konfigurieren
```bash
cp apps/web/.env.example apps/web/.env
```

### 5) Dev-Server starten
```bash
npm run dev
```
- WebApp läuft auf `http://localhost:5173`
- API läuft auf `http://localhost:4000`

---

## Wechsel zu Postgres
1. In `apps/api/.env` den `DATABASE_URL` anpassen:
```
DATABASE_URL="postgresql://user:pass@localhost:5432/deutsch"
```
2. In `apps/api/prisma/schema.prisma` den Provider ändern:
```
provider = "postgresql"
```
3. Migrationen neu ausführen:
```bash
npx prisma migrate dev --name init
```

---

## DeepSeek anbinden
In `apps/api/.env`:
```
DEEPSEEK_API_KEY=dein_api_key
DEEPSEEK_BASE_URL=https://api.deepseek.com
```
Die API ruft DeepSeek per Proxy auf, damit der Schlüssel nicht im Frontend sichtbar ist.

---

## Telegram WebApp Setup
1. Telegram Bot erstellen (BotFather).
2. WebApp URL im Bot konfigurieren.
3. Frontend URL in `CLIENT_ORIGIN` setzen.
4. Telegram initData wird automatisch vom WebApp SDK geliefert.

---

## Hosting ohne Geld (Budget: 30 UAH)
Wenn du **kein Hosting** hast und **nicht nachdenken willst**:
- Starte die App **auf deinem eigenen PC/Laptop** mit Docker.
- Der Cloudflare Tunnel macht sie öffentlich (kostenlos).
- Du brauchst **keinen Domain-Namen**.

Kurz: **ein Befehl → Link → Telegram Button**.

---

## Payment-Provider anbinden
Jeder Provider hat einen Adapter im Backend. Nach Konfiguration werden Webhooks verarbeitet und Zahlungen in der DB gespeichert.

### Telegram Stars
- `TELEGRAM_STARS_PROVIDER_TOKEN` setzen.
- In Bot API Invoices erstellen.
- Webhook-Endpoint: `/api/webhooks/telegram_stars`

### TON
- `TON_RECEIVER_ADDRESS` setzen.
- Client erhält `ton://transfer/...` URL.
- Webhook-Endpoint: `/api/webhooks/ton`

### USDT (TON Netzwerk)
- Warum TON: Schnell, geringe Gebühren, Telegram-affin, einfache Wallet-Integration.
- `USDT_TON_RECEIVER_ADDRESS` setzen.
- Webhook-Endpoint: `/api/webhooks/usdt_ton`

### Portmone
- `PORTMONE_MERCHANT_ID` + `PORTMONE_SECRET` setzen.
- Redirect-Flow nutzen.
- Webhook-Endpoint: `/api/webhooks/portmone`

### Capitalist
- `CAPITALIST_API_KEY` + `CAPITALIST_SECRET` setzen.
- Webhook-Endpoint: `/api/webhooks/capitalist`

**Webhook-Schutz**
Alle Webhooks prüfen den Header `x-webhook-secret` gegen `PAYMENT_WEBHOOK_SECRET`.

---

## Admin-Panel
- URL: `/admin`
- Zugang über Telegram ID Whitelist (`ADMIN_IDS`) oder DB-Tabelle `Admin`.
- Rollen: `admin`, `moderator` (Model `Admin`).

**Funktionen**
- Nutzerliste + VIP Verwaltung
- Monetarisierungseinstellungen
- CRUD für Werbung
- AI Logs & Kostenübersicht

---

## Monetarisierungsstrategie
### Free
- Max 5 Aufgaben/Tag
- Banner + Interstitial Ads
- Strengeres Rate-Limit
- Kürzere Erklärungen

### VIP
- Keine Werbung
- Unlimitierte Aufgaben
- Detaillierte Erklärungen (DE + RU)
- Priorisierte Generierung
- Themenauswahl für Grammatik

### Preisstruktur (Telegram Audience)
- 1 Monat: **7 €**
- 3 Monate: **18 €** (−15%)
- 12 Monate: **60 €** (−30%)
- Lifetime: **120 €**

**Begründung**:
- Telegram-Nutzer sind preissensibel, bevorzugen kleine, mobile Zahlungen.
- 7 €/Monat entspricht dem typischen Abo-Preisbereich für Micro-Learning.
- Jahresabo mit 60 € belohnt langfristige Bindung und reduziert Churn.
- Lifetime mit 120 € ist attraktiv für Vielnutzer und erzeugt sofortigen Cashflow.

---

## Skalierung
- API mit horizontalem Scaling (Node Cluster / Docker / Kubernetes).
- Postgres statt SQLite bei höherem Traffic.
- Redis für Rate Limiting und Session Cache.
- CDN für statische Assets + Ad-Images.

---

## Break-Even Beispiel
Annahmen:
- Serverkosten: 100 €/Monat
- DeepSeek Kosten: 0.002 € pro Aufgabe (VIP) / 0.001 € (Free)
- Ziel: 50 zahlende VIPs

Rechnung:
- 50 VIPs × 7 € = 350 €/Monat
- Abzüglich ca. 120 € Infrastruktur/AI → ca. 230 € Gewinn

**Fazit**: Bereits ~50 zahlende Nutzer decken Kosten und liefern Gewinn.

---

## Hinweise
- `apps/api` enthält vollständige Prisma-Modelle: `User`, `Subscription`, `Payment`, `Ad`, `Admin`.
- Für Production: HTTPS, sicheren Reverse Proxy und Monitoring aktivieren.
