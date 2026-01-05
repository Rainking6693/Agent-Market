# -*- coding: utf-8 -*-
import sys
import io

if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

from playwright.sync_api import sync_playwright
import time

# Test the complete invite flow
with sync_playwright() as p:
    browser = p.chromium.launch(headless=False)
    context = browser.new_context()
    page = context.new_page()

    # Enable console logging
    page.on('console', lambda msg: print(f"[Browser Console] {msg.type}: {msg.text}"))

    # Step 1: Go to login to generate an invite link as admin
    print("=" * 60)
    print("STEP 1: Login as admin to generate invite link")
    print("=" * 60)

    page.goto('https://swarmsync.ai/login')
    page.wait_for_load_state('networkidle')

    print("\nPlease log in as admin manually...")
    print("Waiting 30 seconds for you to log in...")
    time.sleep(30)

    # Step 2: Navigate to invite generation page
    print("\n" + "=" * 60)
    print("STEP 2: Navigate to invite generation page")
    print("=" * 60)

    page.goto('https://swarmsync.ai/console/beta-invites')
    page.wait_for_load_state('networkidle')
    time.sleep(2)
    page.screenshot(path='admin-invite-page.png')

    # Step 3: Generate an invite
    print("\n" + "=" * 60)
    print("STEP 3: Generate invite link")
    print("=" * 60)

    # Fill form and submit
    page.fill('input[name="maxUses"]', '5')  # Allow 5 uses for testing
    page.click('button:has-text("Generate")')
    time.sleep(3)

    # Get the generated URL
    generated_url = page.locator('input[readonly]').input_value()
    print(f"\nGenerated invite URL: {generated_url}")
    page.screenshot(path='invite-generated.png')

    # Step 4: Open invite link in new incognito context (fresh user)
    print("\n" + "=" * 60)
    print("STEP 4: Test invite link as new user")
    print("=" * 60)

    # Close first context
    context.close()

    # Open fresh incognito context
    new_context = browser.new_context()
    new_page = new_context.new_page()
    new_page.on('console', lambda msg: print(f"[New User Console] {msg.type}: {msg.text}"))

    print(f"\nNavigating to: {generated_url}")
    new_page.goto(generated_url)
    new_page.wait_for_load_state('networkidle')
    time.sleep(2)

    current_url = new_page.url
    print(f"Current URL after invite: {current_url}")
    new_page.screenshot(path='after-invite-click.png')

    # Check if we're at login page
    if '/login' in current_url:
        print("\n✓ Correctly redirected to login page")
        print(f"  Callback URL should be in query params: {current_url}")

        # Check for Google login button
        google_btn = new_page.locator('button:has-text("Google")')
        if google_btn.count() > 0:
            print("\n✓ Google login button found")
            print("\nNow testing Google OAuth flow...")
            print("NOTE: This will open Google sign-in. It should redirect back to the invite page after login.")
            print("\nWaiting 5 seconds before clicking Google login...")
            time.sleep(5)

            google_btn.click()
            print("Clicked Google login button")

            # Wait for potential navigation
            print("\nWaiting 15 seconds to see what happens...")
            time.sleep(15)

            final_url = new_page.url
            print(f"\nFinal URL: {final_url}")
            new_page.screenshot(path='final-state-invite-test.png')

            if '/invite/' in final_url:
                print("\n✅ SUCCESS! Stayed on invite page - checking if accepted...")
                time.sleep(3)
                new_page.screenshot(path='invite-accepted.png')

                # Check for success message
                if new_page.locator('text=/success|welcome|granted/i').count() > 0:
                    print("✅ INVITE ACCEPTED SUCCESSFULLY!")
                else:
                    print("⚠️  Still on invite page but no success message visible")
            else:
                print(f"\n❌ FAILED: Ended up at {final_url} instead of invite page")
        else:
            print("\n❌ Google login button not found")
    else:
        print(f"\n❌ Not redirected to login, currently at: {current_url}")

    print("\nTest complete. Check screenshots for details.")
    browser.close()
