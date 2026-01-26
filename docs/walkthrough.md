# Walkthrough: Youngrim Authentication Transfer

I have implemented the "Authentication Transfer" strategy to ensure stable and unattended login to the Youngrim OMS system.

## Changes Made

### 1. Secure Credential Management
- Created a [`.env`](file:///c:/Users/DSAI/shop_ver20.10/.env) file to store `YOUNGRIM_ID` and `YOUNGRIM_PW`.
- Updated [`requirements.txt`](file:///c:/Users/DSAI/shop_ver20.10/requirements.txt) to include `python-dotenv`.

### 2. Automated Login Script
- Refactored [`login_door_yl.py`](file:///c:/Users/DSAI/shop_ver20.10/login_door_yl.py) with the following features:
    - **Auto-Login**: Automatically fills the ID and Password fields upon navigation.
    - **Auth Detection**: Detects if "New Device Authentication" is required and pauses for the user to complete it.
    - **Session Persistence**: Saves all login cookies and session data in the `avast_automation_profile` directory.

## How to Verify

1. **Run the script**:
   ```powershell
   python login_door_yl.py
   ```
2. **First-time Authentication**:
   - The browser will open and automatically enter your credentials.
   - If Youngrim asks for "New Device Authentication", please complete it manually in the browser window.
   - Press **Enter** in the terminal once done.
3. **Session Verification**:
   - Close the browser and run the script again.
   - It should now navigate directly to the dashboard without asking for credentials or authentication.

## Next Steps
- Once you confirm that the login is persistent, we can enable **Headless mode** to make the process completely invisible.
