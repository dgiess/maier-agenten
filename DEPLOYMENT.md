# Schritt-für-Schritt Deployment-Anleitung

## Alles verstanden? Folge diesen Schritten:

### A. GitHub hochladen (einmalig)

1. **Terminal öffnen** (PowerShell auf Windows oder Terminal auf Mac)

2. **Zum Projekt-Ordner navigieren:**
   ```
   cd Downloads/maier-agenten-app
   ```
   (Anpassen, wo du die Datei entpackt hast)

3. **Git initialisieren:**
   ```
   git init
   git add .
   git commit -m "Initial: Maier Agentensystem"
   git branch -M main
   ```

4. **GitHub Repository erstellen:**
   - Geh auf https://github.com/new
   - Name: `maier-agenten`
   - Nicht initialisieren mit README
   - Create Repository

5. **Code hochladen:**
   ```
   git remote add origin https://github.com/dgiess/maier-agenten.git
   git push -u origin main
   ```

### B. Auf Vercel deployen

1. **Vercel-Konto:**
   - Geh auf https://vercel.com
   - "Sign up" mit GitHub-Konto
   - Autorisieren

2. **Projekt importieren:**
   - Klick auf "New Project"
   - "Import Git Repository"
   - Wähle `maier-agenten`
   - Framework: Next.js (wird automatisch erkannt)

3. **Environment Variables setzen:**
   - Environment Variables > Add
   - Name: `ANTHROPIC_API_KEY`
   - Value: Dein API Key (von https://console.anthropic.com)
   - "Add Environment Variable"

4. **Deploy:**
   - Klick "Deploy"
   - Warten... (~3 Minuten)

5. **Fertig!**
   - URL sieht so aus: https://maier-agenten-dgiess.vercel.app
   - Speichern!

### C. Azure konfigurieren (nur nötig für Phase 2 - OneDrive)

Skip für jetzt — machen wir später.

## Testen

Öffne deine Vercel-URL und probier:
- "Hallo Team"
- "Wie geht's?"
- "Analysier den Food Waste"

## Änderungen machen & neu deployen

Wenn du Code änderst:
```bash
git add .
git commit -m "Update: Beschreibung der Änderung"
git push
```

Vercel deployed automatisch neu! ⚡
