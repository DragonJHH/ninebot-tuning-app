# Ninebot Tuning App - Windows 11 Anleitung

## 🚀 Schnellstart für Windows 11

### Schritt 1: Voraussetzungen installieren

#### Git installieren
1. Gehe zu https://git-scm.com/download/win
2. Lade die **64-bit Version** herunter
3. Installiere mit **Standard-Einstellungen**
4. Starte deinen PC neu

#### Node.js installieren (Optional, nur wenn du lokal testen möchtest)
1. Gehe zu https://nodejs.org
2. Lade **LTS Version** herunter
3. Installiere mit Standard-Einstellungen

---

### Schritt 2: ZIP-Datei entpacken

1. **Lade `ninebot-tuning-app-source.zip` herunter**
2. **Rechtsklick auf die ZIP-Datei**
3. **Wähle "Alle extrahieren"**
4. **Entpacke in einen Ordner** (z.B. `C:\Users\Tom\ninebot-tuning-app`)

---

### Schritt 3: PowerShell öffnen

1. **Öffne den entpackten Ordner** `ninebot-tuning-app`
2. **Rechtsklick im leeren Bereich**
3. **Wähle "Open PowerShell window here"** (oder "In PowerShell öffnen")
4. **Die PowerShell öffnet sich im richtigen Ordner**

---

### Schritt 4: Git konfigurieren

**Kopiere diese Befehle in PowerShell und drücke Enter:**

```powershell
git config --global user.email "dein-email@example.com"
git config --global user.name "Dein Name"
```

**Beispiel:**
```powershell
git config --global user.email "tom@example.com"
git config --global user.name "Tom"
```

---

### Schritt 5: Code zu GitHub hochladen

**Kopiere ALLE diese Befehle nacheinander in PowerShell:**

```powershell
git init
git add .
git commit -m "Initial commit: Ninebot Tuning App"
git remote add origin https://github.com/Red200111/ninebot-tuning-app.git
git branch -M main
git push -u origin main
```

**Wenn du nach Passwort gefragt wirst:**
- **Gib dein GitHub-Passwort ein** ODER
- **Gib einen Personal Access Token ein** (siehe unten)

---

### Schritt 6: GitHub Personal Access Token (WICHTIG!)

**Wenn dein Passwort nicht funktioniert:**

1. Gehe zu https://github.com/settings/tokens
2. Klick auf "Generate new token"
3. Gib einen Namen ein (z.B. "ninebot-app")
4. Wähle diese Optionen:
   - ✅ `repo` (Vollzugriff auf Repositories)
   - ✅ `workflow` (GitHub Actions)
5. Klick "Generate token"
6. **KOPIERE den Token** (lange Zeichenkette)
7. **In PowerShell:** Gib diesen Token statt dem Passwort ein

---

### Schritt 7: GitHub Actions konfigurieren

1. Gehe zu https://github.com/Red200111/ninebot-tuning-app
2. Klick auf **"Actions"** Tab
3. Klick auf **"set up a workflow yourself"**
4. **Lösche den vorhandenen Code**
5. **Kopiere diesen Code:**

```yaml
name: Build APK

on:
  push:
    branches: [ main ]
  workflow_dispatch:

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install pnpm
        run: npm install -g pnpm
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Setup Java
        uses: actions/setup-java@v3
        with:
          distribution: 'zulu'
          java-version: '11'
      
      - name: Build APK
        run: |
          npx expo prebuild --clean
          cd android
          ./gradlew assembleRelease
      
      - name: Upload APK
        uses: actions/upload-artifact@v3
        with:
          name: app-release.apk
          path: android/app/build/outputs/apk/release/app-release.apk
```

6. Klick **"Start commit"**
7. Klick **"Commit new file"**

---

### Schritt 8: APK bauen lassen

1. Gehe zu https://github.com/Red200111/ninebot-tuning-app
2. Klick auf **"Actions"** Tab
3. **Warte auf den Build** (ca. 20-30 Minuten)
4. Wenn der Build fertig ist (grüner Haken ✅):
   - Klick auf den Build
   - Scrolle nach unten zu **"Artifacts"**
   - Klick auf **"app-release.apk"** zum Herunterladen

---

## 📱 APK auf Android-Handy installieren

### Methode 1: USB-Kabel (Schnellste Methode)

1. **Lade Android SDK Platform Tools herunter:**
   - Gehe zu https://developer.android.com/studio/releases/platform-tools
   - Lade für Windows herunter
   - Entpacke in einen Ordner (z.B. `C:\platform-tools`)

2. **Aktiviere USB-Debugging auf deinem Handy:**
   - Einstellungen → Über das Telefon
   - Tippe 7x auf "Build-Nummer"
   - Gehe zu Entwickleroptionen
   - Aktiviere "USB-Debugging"

3. **Verbinde dein Handy mit USB-Kabel**

4. **Öffne PowerShell im `platform-tools` Ordner**

5. **Führe aus:**
   ```powershell
   .\adb install C:\Users\Tom\Downloads\app-release.apk
   ```
   (Ersetze den Pfad mit deinem Download-Ordner)

6. **Fertig!** Die App wird installiert

### Methode 2: Datei-Manager (Einfach)

1. **Lade die APK herunter**
2. **Kopiere die Datei auf dein Handy** (via USB oder Cloud)
3. **Öffne Datei-Manager** auf deinem Handy
4. **Navigiere zur APK-Datei**
5. **Tippe darauf** → "Installieren"
6. **Bestätige die Installation**

### Methode 3: Email/Cloud (Einfach)

1. **Lade die APK herunter**
2. **Sende dir selbst per Email** oder lade zu Google Drive hoch
3. **Öffne auf deinem Handy**
4. **Tippe auf die Datei** → "Installieren"

---

## ⚠️ Häufige Fehler und Lösungen

### Fehler: "git: command not found"
**Lösung:** Git ist nicht installiert
- Installiere Git von https://git-scm.com/download/win
- Starte PowerShell neu

### Fehler: "Permission denied"
**Lösung:** Passwort/Token ist falsch
- Überprüfe dein GitHub-Passwort
- Oder erstelle einen Personal Access Token (siehe Schritt 6)

### Fehler: "Repository not found"
**Lösung:** Repository wurde nicht erstellt
- Gehe zu https://github.com/new
- Erstelle ein neues Repository mit Namen `ninebot-tuning-app`
- Versuche erneut

### Build fehlgeschlagen auf GitHub
**Lösung:** Warte 5 Minuten und versuche erneut
- Manchmal braucht GitHub länger
- Klick auf "Re-run jobs" um erneut zu versuchen

### APK Installation fehlgeschlagen
**Lösung:** 
- Stelle sicher, dass "Unbekannte Apps installieren" erlaubt ist
- Einstellungen → Apps → Spezialzugriff → Unbekannte Apps installieren
- Aktiviere für deinen Browser oder Datei-Manager

---

## 🎉 Fertig!

Deine Ninebot Tuning App ist jetzt installiert und funktioniert zu 100%!

**Viel Spaß beim Tunen! 🚀**

---

## 📞 Troubleshooting

**Wenn etwas nicht funktioniert:**

1. **Überprüfe, dass Git installiert ist:**
   ```powershell
   git --version
   ```

2. **Überprüfe deine GitHub-Verbindung:**
   ```powershell
   git config --global user.name
   git config --global user.email
   ```

3. **Versuche einen sauberen Push:**
   ```powershell
   git status
   git add .
   git commit -m "Fix"
   git push
   ```

4. **Wenn immer noch nicht funktioniert:** Sag mir Bescheid! 📧
