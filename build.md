# Android Build & Deployment Guide 📱

> Reference guide for building, updating, and testing **The Three Things** on an actual Android device.

---

## ⚡ Quick Rebuild (Single Command)

Whenever UI or code changes are made, run this single command from the project root:

```bash
npm run build:android
```

This automated script performs the full pipeline:
1. Runs TypeScript checks & builds Vite production assets (`tsc && vite build` → `dist/`)
2. Syncs the web assets into the Android native project (`npx cap sync android`)
3. Runs Gradle to compile the debug APK (`cd android && .\gradlew.bat assembleDebug`)

---

## 📦 APK Output Locations

After building, the APK can be found in two places:

1. **Root Directory (Convenient Access):**
   ```
   TheThreeThings.apk
   ```
   *(Full path: `C:\Users\GGPC\Desktop\todaysthree\TheThreeThings.apk`)*

2. **Gradle Output Directory:**
   ```
   android/app/build/outputs/apk/debug/app-debug.apk
   ```

---

## 📲 How to Install & Test on Your Android Phone

### Option A: USB Cable via ADB (Fastest for iterative testing)
1. Plug your Android phone into your PC with a USB cable.
2. Enable **Developer Options** and **USB Debugging** on the phone.
3. Check connection:
   ```powershell
   & "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe" devices
   ```
4. Install/update the app on your phone with one command:
   ```powershell
   & "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe" install -r TheThreeThings.apk
   ```

---

### Option B: Direct Phone Download / Sideloading
1. Send `TheThreeThings.apk` to your phone via:
   - **Local Web Server (Instant download from phone browser):**
     Run in the project directory:
     ```powershell
     python -m http.server 8000
     ```
     On your phone (connected to the same Wi-Fi), open the browser and navigate to `http://<YOUR_PC_IP>:8000/TheThreeThings.apk`.
   - **Cloud / Chat:** Upload to Google Drive, Discord, Telegram, or email to yourself.
   - **USB File Transfer:** Drag and drop `TheThreeThings.apk` into your phone's `Download` folder.
2. On your phone, tap `TheThreeThings.apk` in your **Downloads** / **Files** app.
3. Tap **Install** (if prompted, allow *"Install unknown apps"* for your browser or file manager).
4. Launch **The Three Things**.

---

### Option C: Android Studio GUI
Open the [`android/`](file:///c:/Users/GGPC/Desktop/todaysthree/android) directory in Android Studio:
- Press the green **Run ▶** button to deploy and attach live logcat debugging to any connected physical phone or emulator.

---

## 🛠️ Environment & Toolchain Details

For future agents or automated sessions running on this machine:

- **Java JDK:** Eclipse Adoptium JDK 21 (`C:\Program Files\Eclipse Adoptium\jdk-21.0.12.101-hotspot`)
- **Android SDK:** `C:\Users\GGPC\AppData\Local\Android\Sdk` (configured in [`android/local.properties`](file:///c:/Users/GGPC/Desktop/todaysthree/android/local.properties))
- **Target SDK / Platforms:** Android 36 (`android-36`), Min SDK: 24 (Android 7.0+)
- **Capacitor Configuration:** [`capacitor.config.ts`](file:///c:/Users/GGPC/Desktop/todaysthree/capacitor.config.ts)
  - `appId`: `com.thethreethings.app`
  - `appName`: `The Three Things`
  - `webDir`: `dist`

---

## 🤖 Instructions for AI Agents in Subsequent Sessions

When the user asks you to modify the app and prepare it for Android:
1. Make your code/UI changes in `src/`.
2. Run `npm run build` to ensure zero TypeScript/Vite compilation errors.
3. Run `npx cap sync android` to sync web assets.
4. Run Gradle assemble:
   ```powershell
   $env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-21.0.12.101-hotspot"
   $env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
   Set-Location android
   .\gradlew.bat assembleDebug
   Copy-Item -Path "app\build\outputs\apk\debug\app-debug.apk" -Destination "..\TheThreeThings.apk" -Force
   Set-Location ..
   ```
5. Confirm to the user that `TheThreeThings.apk` in the root has been refreshed and is ready to install.
