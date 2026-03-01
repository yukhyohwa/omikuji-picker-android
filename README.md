# Decision Master Pro (Formerly Omikuji Picker)

A professional, feature-rich random-drawing and decision-making application running as an Android WebView wrapper with modern web technologies. 

## ✨ Key Features

- **Three Distinct Decision Modes**:
  - **🧧 御神籤 (Omikuji Mode)**: Traditional Japanese fortune-telling style with a shaking cylinder and physical lot-popping animation.
  - **🎲 掷骰子 (Dice Mode)**: A 3D interactive CSS dice that realistically rotates and lands on a random face (1-6).
  - **🃏 抽卡 (Card Mode)**: Choose your fate from a deck of cards with interactive 3D flip animations.

- **Fast Mode Switching**: Seamlessly toggle between modes directly from the home screen using the new capsule tabs.

- **Rich Presets & Customization**: Built-in collections for various life scenarios:
  - 🍱 Restaurant Picker (What to eat?)
  - ✔️ Yes/No generator
  - 🎨 Daily Lucky Color
  - 🃏 Poker Cards
  - 🧧 Standard Omikuji Fortunes
  - *Plus: Fully customizable groups where you can manage your own options and labels.*

- **📜 Draw History**: Keep track of your past decisions with timestamps and categories. Accessible via a persistent bottom-bar icon.

- **💎 Premium Glassmorphic UI**: Beautiful, modern aesthetic with frosted glass effects, smooth gradients, high-quality typography (Outfit & Playfair Display), and responsive interactive animations.

- **📳 Haptic Feedback Integration**: Native Android `Vibrator` service bridged smoothly with Javascript, providing realistic tactile feedback for cylinder-shaking (continuous pulse) and card/lot revealing (sharp pops).

- **💾 Persistent State**: All custom groups, preferences, and history logs are saved instantly via `LocalStorage`.

## 📱 How to Use
1. **Launch**: Open the app to see the main stage.
2. **Select Mode**: Tap on the mode tabs (抽签, 骰子, 抽卡) at the top to choose your experience.
3. **Draw**: 
   - *Omikuji*: Tap `开始抽签` to shake the box.
   - *Dice*: Tap `掷骰子` to start rolling.
   - *Cards*: Simply tap directly on any card in the deck to reveal it.
4. **History**: Tap the 📜 icon at the bottom to view your past choices.
5. **Configure**: Tap the ⚙️ icon to load presets, create new custom collections, or edit individual items in your current collection.

## 🛠️ Technical Profile
- **Platform**: Android (WebView `MainActivity.java` with explicit TLS fixing and `compileSdk 36`).
- **Engine**: HTML5, Vanilla Javascript, Advanced CSS3 (3D Transforms, Glassmorphism).
- **Native Bridge**: Android `@JavascriptInterface` injecting vibrate capabilities into the web context.
- **State Management**: Zero-dependency `LocalStorage` JSON persistence.
