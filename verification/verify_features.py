
import os
from playwright.sync_api import sync_playwright

def verify_features():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Construct file URL
        cwd = os.getcwd()
        file_path = f"file://{cwd}/app/src/main/assets/index.html"
        print(f"Loading: {file_path}")

        page.goto(file_path)

        # 1. Omikuji Tab (Default)
        print("Verifying Omikuji Tab...")
        # Add initial wait to ensure page load
        page.wait_for_timeout(1000)
        page.screenshot(path="verification/1_omikuji_default.png")

        # 2. Dice Tab
        print("Verifying Dice Tab...")
        page.click(".nav-item[data-target='tab-dice']")
        # Wait for tab activation
        page.wait_for_selector("#tab-dice.active")
        # Wait for transition
        page.wait_for_timeout(1000)
        page.screenshot(path="verification/2_dice_tab.png")

        # Roll Dice
        print("Rolling Dice...")
        page.click("#roll-dice-btn")
        # Wait for result overlay to appear
        # The class 'hidden' is removed when showing
        # We wait for it to be visible (state='visible' is default)
        page.wait_for_selector("#result-overlay:not(.hidden)", timeout=5000)
        page.screenshot(path="verification/3_dice_result.png")

        # Close Overlay
        print("Closing Overlay...")
        page.click("#close-result")

        # Wait for the overlay to be hidden.
        # We can wait for the element #result-overlay to be in state 'hidden'
        page.wait_for_selector("#result-overlay", state="hidden")
        page.screenshot(path="verification/3b_overlay_closed.png")

        # 3. Cards Tab
        print("Verifying Cards Tab...")
        page.click(".nav-item[data-target='tab-cards']")
        page.wait_for_selector("#tab-cards.active")
        page.wait_for_timeout(1000)
        page.screenshot(path="verification/4_cards_tab.png")

        # Draw Card
        print("Drawing Card...")
        page.click("#draw-card-btn")
        # Wait for result overlay
        page.wait_for_selector("#result-overlay:not(.hidden)", timeout=5000)
        page.screenshot(path="verification/6_card_result.png")

        # Close Overlay
        print("Closing Overlay...")
        page.click("#close-result")
        page.wait_for_selector("#result-overlay", state="hidden")

        # 4. Theme Switching
        print("Verifying Theme Switching...")
        page.click("#config-toggle")
        # Wait for panel to slide in (remove hidden class)
        # Note: config-panel also uses .hidden class for visibility state
        page.wait_for_selector("#config-panel:not(.hidden)")
        page.screenshot(path="verification/7_settings_open.png")

        # Switch to Dark Mode
        print("Switching to Dark Mode...")
        # Select button with data-theme='dark'
        page.click(".theme-opt[data-theme='dark']")
        page.wait_for_timeout(500) # Wait for transition
        page.screenshot(path="verification/8_dark_mode_settings.png")

        # Close Settings
        # It seems playwright considers the panel "visible" even when transform moves it off screen?
        # The config panel uses transform: translateX(100%) to hide, but display stays flex/block?
        # CSS: .config-panel { position: fixed ... transform: translateX(100%); }
        # Playwright checks for visibility (opacity, display:none, visibility:hidden). It might not account for off-screen transform as "hidden".
        # So we can't use state="hidden". We should check if it has class "hidden".

        page.click("#config-close")
        page.wait_for_selector("#config-panel.hidden")
        page.wait_for_timeout(500)
        page.screenshot(path="verification/9_dark_mode_main.png")

        # Switch back to Light Mode
        print("Restoring Light Mode...")
        page.click("#config-toggle")
        page.wait_for_selector("#config-panel:not(.hidden)")
        page.click(".theme-opt[data-theme='light']")
        page.click("#config-close")
        page.wait_for_selector("#config-panel.hidden")
        page.wait_for_timeout(500)
        page.screenshot(path="verification/10_light_mode_restored.png")

        browser.close()
        print("Verification complete. Screenshots saved in 'verification/'")

if __name__ == "__main__":
    verify_features()
