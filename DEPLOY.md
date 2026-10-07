# AI Agent Central — Deploy (SRV00209)

Isoliertes Deploy auf dem Shared Testserver. Co-Tenants HOR und DERBYSTAR werden nicht angefasst.

## Facts

| Feld | Wert |
|------|------|
| Host | SRV00209 · `10.1.101.132` (VPN) |
| Remote-Pfad | `~/ai-agent-central/` |
| Compose-Projekt | `ai-agent-central` |
| Container | `ai-agent-central-app-1` |
| Host-Port | **3002** → Container `3000` |
| Volume | `ai-agent-central_ai-agent-central_data` (SQLite) |
| URL | http://10.1.101.132:3002 |
| nginx/TLS | keines |

## Start / Stop / Logs

```bash
cd ~/ai-agent-central

# Start
docker compose -p ai-agent-central up -d

# Stop (nur dieses Projekt)
docker compose -p ai-agent-central down

# Logs
docker compose -p ai-agent-central logs -f --tail 100
```

## Redeploy

```bash
cd ~/ai-agent-central
# Code aktualisieren, dann:
docker compose -p ai-agent-central up -d --build
```

## DB neu seeden (löscht nur eigene Demo-Daten)

```bash
cd ~/ai-agent-central
docker compose -p ai-agent-central down
docker volume rm ai-agent-central_ai-agent-central_data
docker compose -p ai-agent-central up -d
```

## Nicht anfassen

- `~/house-of-retail/`, Port **3000**, Volumes `*_preview_*`
- `~/derbystar-prototype/`, Port **3001**, Volume `derbystar_data`
- Host-nginx / TLS
