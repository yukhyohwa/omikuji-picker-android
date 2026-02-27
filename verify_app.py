from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page()
    page.goto("http://localhost:8000")

    # 1. Verify Presets and Config
    # Open config panel
    page.click("#config-toggle")

    # Select 'Restaurant' preset
    page.select_option("#preset-select", "restaurant")

    # Verify inputs are populated (check first item is Pizza)
    first_input = page.locator(".lot-input-wrapper input").first
    print(f"First input value: {first_input.input_value()}")
    if first_input.input_value() != "Pizza":
        print("Error: Restaurant preset not loaded correctly")

    # Apply changes (important!)
    page.click("#save-config")

    # 2. Verify Draw and History
    # Click draw button
    page.click("#draw-btn")

    # Wait for result overlay
    page.wait_for_selector("#result-overlay:not(.hidden)", timeout=5000)

    # Get result text
    result_text = page.locator("#result-content").text_content()
    print(f"Result: {result_text}")

    # Verify result is one of the restaurant items
    restaurant_items = ["Pizza", "Sushi", "Burger", "Pasta", "Salad", "Chinese", "Tacos", "Steak", "Ramen", "Curry"]
    if result_text not in restaurant_items:
        print(f"Error: Result '{result_text}' not found in restaurant list")

    # Close result overlay
    page.click("#close-result")

    # Open history panel
    page.click("#history-toggle")

    # Verify history entry
    history_item = page.locator("#history-list li").first
    history_content = history_item.locator(".history-content").text_content()
    print(f"History item: {history_content}")

    if history_content != result_text:
        print("Error: History item does not match result")

    # Take screenshot of history panel
    page.screenshot(path="verification_history_restaurant.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
