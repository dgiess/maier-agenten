# Rolf Maier & Co AG - KI-Agentensystem

## Übersicht

Professionelle Next.js-App mit vier spezialisierten KI-Agenten:
- **Leon** — Orchestrator/Koordination
- **Lorena** — Controlling & Finanzanalysen
- **Sabrina** — Filialmanagement & operative Themen
- **Mirjam** — Administration & Kommunikation

## Voraussetzungen

- Node.js 18+ (von https://nodejs.org/)
- GitHub-Konto (für Deployment)
- Anthropic API Key
- Vercel-Konto (kostenlos)

## Lokale Installation (zum Testen)

```bash
# 1. Projekt klonen/öffnen
cd maier-agenten-app

# 2. Dependencies installieren
npm install

# 3. .env.local erstellen
cp .env.local.example .env.local

# 4. API Key setzen
# Öffne .env.local und trage dein ANTHROPIC_API_KEY ein

# 5. Dev-Server starten
npm run dev

# 6. Browser öffnen
# http://localhost:3000
```

## Deployment auf Vercel

### Schritt 1: Code auf GitHub hochladen

1. Geh auf https://github.com/new
2. Repo-Name: `maier-agenten`
3. Description: `KI-Agentensystem für Rolf Maier & Co AG`
4. Public oder Private (deine Wahl)
5. "Create repository" klicken

Dann im Terminal:
```bash
git init
git add .
git commit -m "Initial commit: Maier Agenten System"
git branch -M main
git remote add origin https://github.com/dgiess/maier-agenten.git
git push -u origin main
```

### Schritt 2: Auf Vercel deployen

1. Geh auf https://vercel.com/new
2. "Import Git Repository" klicken
3. Dein `maier-agenten` Repo auswählen
4. "Import" klicken

**Environment Variables setzen:**
- Key: `ANTHROPIC_API_KEY`
- Value: Dein Anthropic API Key

Dann "Deploy" klicken — fertig!

Deine App läuft dann auf:
`https://maier-agenten-<username>.vercel.app`

### Schritt 3: Redirect URI in Azure aktualisieren

1. Geh zu https://portal.azure.com
2. Azure Active Directory > App registrations > Deine App
3. Authentifizierung > Redirect URIs
4. Füge hinzu:
   - `https://maier-agenten-<username>.vercel.app/api/auth/callback`
   - `https://maier-agenten-<username>.vercel.app`

## Agenten-Skills

Alle vier Agenten haben vollständige Skill-Profile mit:
- Fachkompetenzen
- Schweizer Rechnungswesen (Lorena)
- Gastronomie-Logik (alle)
- Kommunikationsstil (Schweizer Hochdeutsch)
- Zielkriteria

Die Skills sind im System-Prompt hinterlegt und nicht im UI sichtbar.

## Datenverwaltung

Aktuell:
- Agents arbeiten mit generischen Daten
- Keine OneDrive-Integration (Phase 2)
- Du kannst Firmendaten später hinzufügen

## Troubleshooting

**"API Key ungültig"**
- Überprüf dein ANTHROPIC_API_KEY in .env.local
- Muss ein gültiger Claude API Key sein

**"Agents antworten nicht"**
- Prüf die Browser-Console (F12 > Console)
- Prüf Vercel Logs (dashboard.vercel.com > Dein Projekt > Logs)

**"Styling sieht komisch aus"**
- Hard-refresh: Ctrl+Shift+R (Windows) oder Cmd+Shift+R (Mac)

## Nächste Schritte

- Phase 2: OneDrive-Integration
- Phase 3: Persistente Datenspeicherung
- Phase 4: Multi-User mit Authentifizierung

## Support

Dokumentation: https://docs.claude.com
Vercel Docs: https://vercel.com/docs
