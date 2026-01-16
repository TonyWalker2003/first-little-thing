# Android APK 構建指南

本指南將協助您使用 Capacitor 將牙套日記 PWA 打包成 Android APK。

## 📋 前置需求

在開始之前，請確保已安裝以下工具：

### 1. Java Development Kit (JDK)
- **版本**: JDK 11 或更高版本（推薦 JDK 17）
- **下載**: [Oracle JDK](https://www.oracle.com/java/technologies/javase-downloads.html) 或 [OpenJDK](https://adoptium.net/)
- **環境變數**: 設置 `JAVA_HOME` 指向 JDK 安裝目錄

驗證安裝：
```bash
java -version
```

### 2. Android Studio（推薦）或 Android SDK Command-line Tools
- **下載**: [Android Studio](https://developer.android.com/studio)
- 安裝時請確保包含：
  - Android SDK
  - Android SDK Platform
  - Android SDK Build-Tools
  - Android Emulator（可選，用於測試）

### 3. 環境變數設置

Windows 用戶需要設置以下環境變數：

```powershell
# ANDROID_HOME（指向 Android SDK 的安裝目錄）
# 例如: C:\Users\YourName\AppData\Local\Android\Sdk
```

## 🚀 快速開始

### 方法一：使用 Android Studio（推薦）

這是最簡單且最適合初學者的方法。

#### 步驟 1: 打開 Android 項目
```bash
npm run android:open
```

或手動打開 Android Studio，然後選擇 `File > Open`，選擇項目中的 `android` 文件夾。

#### 步驟 2: 構建 APK

1. 在 Android Studio 中，點擊菜單 `Build > Build Bundle(s) / APK(s) > Build APK(s)`
2. 等待構建完成（首次構建可能需要幾分鐘）
3. 構建完成後，會顯示通知，點擊 "locate" 查看 APK 文件

#### 步驟 3: 找到 APK 文件

APK 文件位於：
```
android/app/build/outputs/apk/debug/app-debug.apk
```

### 方法二：使用命令行構建

適合熟悉命令行的用戶。

#### 步驟 1: 構建並同步
```bash
npm run android:build
```

#### 步驟 2: 進入 Android 目錄並構建
```bash
cd android
./gradlew assembleDebug
```

Windows 用戶使用：
```bash
cd android
gradlew.bat assembleDebug
```

#### 步驟 3: 找到 APK
```
android/app/build/outputs/apk/debug/app-debug.apk
```

## 📦 生成發布版 APK（用於正式發布）

> [!WARNING]
> 發布版 APK 需要簽名密鑰。以下步驟將創建簽名密鑰並生成發布版 APK。

### 1. 創建密鑰庫

```bash
keytool -genkey -v -keystore my-release-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000
```

按照提示輸入密碼和信息。

### 2. 配置簽名

在 `android/app/build.gradle` 中添加簽名配置（在 `android` 區塊中）：

```gradle
signingConfigs {
    release {
        storeFile file("../../my-release-key.keystore")
        storePassword "your-keystore-password"
        keyAlias "my-key-alias"
        keyPassword "your-key-password"
    }
}

buildTypes {
    release {
        signingConfig signingConfigs.release
        minifyEnabled false
        proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
    }
}
```

### 3. 構建發布版

```bash
cd android
./gradlew assembleRelease
```

發布版 APK 位於：
```
android/app/build/outputs/apk/release/app-release.apk
```

## 📱 安裝到手機

### 從電腦傳輸

1. 將 APK 文件傳輸到手機（使用 USB、雲端硬碟、或郵件等方式）
2. 在手機上打開 APK 文件
3. 允許「安裝未知來源的應用」（如果系統要求）
4. 點擊「安裝」

### 使用 ADB（Android Debug Bridge）

如果手機已通過 USB 連接並啟用了 USB 調試：

```bash
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

## 🔄 更新應用

每次修改代碼後，需要重新構建和同步：

```bash
# 1. 構建 Web 應用
npm run build

# 2. 同步到 Android
npm run android:sync

# 3. 重新構建 APK（使用 Android Studio 或 Gradle）
```

## 🛠️ 常見問題

### Q: JAVA_HOME 未設置
**錯誤**: `ERROR: JAVA_HOME is not set`

**解決方案**: 
1. 安裝 JDK
2. 設置環境變數 `JAVA_HOME`
3. 重啟終端/IDE

### Q: Android SDK 未找到
**錯誤**: `SDK location not found`

**解決方案**:
在 `android/local.properties` 中添加：
```properties
sdk.dir=C:\\Users\\YourName\\AppData\\Local\\Android\\Sdk
```

### Q: Gradle 構建失敗
**解決方案**:
1. 檢查網路連接（Gradle 需要下載依賴）
2. 清理並重新構建：
   ```bash
   cd android
   ./gradlew clean
   ./gradlew assembleDebug
   ```

### Q: 應用在手機上無法安裝
**可能原因**:
- 未啟用「安裝未知來源的應用」
- APK 文件損壞（重新構建）
- 存儲空間不足

## 📚 相關資源

- [Capacitor 官方文檔](https://capacitorjs.com/docs)
- [Android 開發者文檔](https://developer.android.com/docs)
- [Gradle 用戶指南](https://docs.gradle.org/current/userguide/userguide.html)

## 🎉 完成！

現在您可以將生成的 APK 安裝到任何 Android 設備上使用了！
