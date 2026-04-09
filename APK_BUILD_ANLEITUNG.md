# Ninebot Tuning App - APK Build Anleitung

## 🚀 Schnellstart (Empfohlen)

### Option 1: Build über Manus Publish (EINFACHSTE METHODE)

1. **Gehe zur Manus-Webseite** (wo du diese App siehst)
2. **Klick auf "Publish" Button** (oben rechts)
3. **Wähle "Android APK"**
4. **Warte auf die Generierung** (ca. 10-15 Minuten)
5. **Lade die APK herunter**
6. **Installiere auf deinem Android-Handy**

**Das ist die einfachste und sicherste Methode!**

---

## Option 2: Build über GitHub Actions (AUTOMATISCH)

### Schritt 1: GitHub Account erstellen
1. Gehe zu https://github.com
2. Klick auf "Sign up"
3. Erstelle einen kostenlosen Account

### Schritt 2: Repository erstellen
1. Gehe zu https://github.com/new
2. **Repository name:** `ninebot-tuning-app`
3. **Beschreibung:** `Ninebot E-Scooter Tuning App`
4. **Visibility:** Public (für GitHub Actions)
5. Klick auf "Create repository"

### Schritt 3: Code hochladen
1. Öffne dein Terminal/Command Prompt
2. Gehe zum Projekt-Verzeichnis:
   ```bash
   cd /home/ubuntu/ninebot-tuning-app
   ```
3. Initialisiere Git:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Ninebot Tuning App"
   ```
4. Verbinde mit GitHub (ersetze `USERNAME` mit deinem GitHub-Namen):
   ```bash
   git remote add origin https://github.com/USERNAME/ninebot-tuning-app.git
   git branch -M main
   git push -u origin main
   ```

### Schritt 4: GitHub Actions konfigurieren
1. Gehe zu deinem Repository auf GitHub
2. Klick auf "Actions" Tab
3. Klick auf "set up a workflow yourself"
4. Kopiere diesen Code:

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
      
      - name: Install dependencies
        run: |
          npm install -g pnpm
          pnpm install
      
      - name: Setup Java
        uses: actions/setup-java@v3
        with:
          distribution: 'zulu'
          java-version: '11'
      
      - name: Build APK
        run: |
          cd android
          ./gradlew assembleRelease
      
      - name: Upload APK
        uses: actions/upload-artifact@v3
        with:
          name: ninebot-tuning-app.apk
          path: android/app/build/outputs/apk/release/app-release.apk
```

5. Klick auf "Start commit"
6. Klick auf "Commit new file"

### Schritt 5: APK herunterladen
1. Gehe zu "Actions" Tab
2. Warte auf den Build (ca. 15-20 Minuten)
3. Wenn fertig, klick auf den Build
4. Scrolle nach unten zu "Artifacts"
5. Klick auf "ninebot-tuning-app.apk" zum Herunterladen

---

## Option 3: Lokaler Build (FORTGESCHRITTENE)

### Voraussetzungen
- Android SDK installiert
- Java 11+ installiert
- Node.js 18+ installiert

### Schritte
```bash
# 1. Gehe zum Projekt
cd /home/ubuntu/ninebot-tuning-app

# 2. Installiere Dependencies
pnpm install

# 3. Prebuild für Android
npx expo prebuild --clean

# 4. Baue APK
cd android
./gradlew assembleRelease

# 5. APK ist hier:
# android/app/build/outputs/apk/release/app-release.apk
```

---

## 📱 Installation auf Android-Handy

### Methode 1: USB-Kabel (Schnellste Methode)
1. **Verbinde dein Handy mit dem Computer** via USB-Kabel
2. **Aktiviere USB-Debugging** auf deinem Handy:
   - Einstellungen → Über das Telefon
   - Tippe 7x auf "Build-Nummer"
   - Gehe zu Entwickleroptionen
   - Aktiviere "USB-Debugging"
3. **Öffne Terminal/Command Prompt**
4. **Führe aus:**
   ```bash
   adb install /path/to/app-release.apk
   ```
5. **Fertig!** Die App wird installiert

### Methode 2: Datei-Manager (Einfach)
1. **Lade die APK herunter**
2. **Kopiere die Datei auf dein Handy** (via USB oder Cloud)
3. **Öffne Datei-Manager** auf deinem Handy
4. **Navigiere zur APK-Datei**
5. **Tippe darauf** → "Installieren"
6. **Bestätige die Installation**

### Methode 3: Email/Cloud (Einfach)
1. **Lade die APK herunter**
2. **Sende dir selbst per Email** oder lade zu Cloud (Google Drive, Dropbox) hoch
3. **Öffne auf deinem Handy**
4. **Tippe auf die Datei** → "Installieren"

---

## ⚠️ Häufige Fehler und Lösungen

### Fehler: "Installation fehlgeschlagen"
**Lösung:** 
- Stelle sicher, dass "Unbekannte Apps installieren" erlaubt ist
- Einstellungen → Apps → Spezialzugriff → Unbekannte Apps installieren
- Aktiviere für deinen Browser oder Datei-Manager

### Fehler: "Bluetooth funktioniert nicht"
**Lösung:**
- Stelle sicher, dass Bluetooth auf deinem Handy **AN** ist
- Stelle sicher, dass dein Scooter **Bluetooth aktiviert** hat
- **Trenne den Scooter von der Segway App** (wichtig!)
- Starte dein Handy neu

### Fehler: "App stürzt ab"
**Lösung:**
- Stelle sicher, dass Android 8+ installiert ist
- Deinstalliere die alte Version und installiere neu
- Lösche den App-Cache: Einstellungen → Apps → Ninebot Tuning → Speicher → Cache leeren

---

## 🔧 Troubleshooting

### Bluetooth Scanning funktioniert nicht
1. **Überprüfe Bluetooth-Permissions:**
   - Einstellungen → Apps → Ninebot Tuning → Berechtigungen
   - Aktiviere "Standort" und "Bluetooth"

2. **Stelle sicher, dass der Scooter erkannt wird:**
   - Öffne Android Bluetooth-Einstellungen
   - Suche nach "Ninebot Kickscooter"
   - Wenn nicht sichtbar, starte den Scooter neu

3. **Wenn immer noch nicht funktioniert:**
   - Deinstalliere die App
   - Starte dein Handy neu
   - Installiere die App neu

### App friert ein
1. **Schließe die App** (Swipe up oder Back Button)
2. **Öffne sie wieder**
3. **Versuche erneut zu scannen**

---

## 📋 Checkliste vor dem Build

- [ ] Node.js 18+ installiert
- [ ] pnpm installiert (`npm install -g pnpm`)
- [ ] Alle Dependencies installiert (`pnpm install`)
- [ ] Keine TypeScript-Fehler (`pnpm check`)
- [ ] Alle Tests bestanden (`pnpm test`)
- [ ] Android SDK installiert (für lokalen Build)
- [ ] Java 11+ installiert (für lokalen Build)

---

## 📞 Support

Wenn etwas nicht funktioniert:
1. **Überprüfe die Logs:** `pnpm build 2>&1 | tail -50`
2. **Stelle sicher, dass alle Voraussetzungen erfüllt sind**
3. **Versuche einen sauberen Build:** `rm -rf android && npx expo prebuild --clean`

---

## 🎉 Fertig!

Deine Ninebot Tuning App ist jetzt installiert und funktioniert zu 100%! 

**Viel Spaß beim Tunen! 🚀**
