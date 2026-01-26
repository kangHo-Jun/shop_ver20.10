# Implementation Plan: Youngrim Authentication Transfer

This plan implements a robust "Authentication Transfer" strategy for Youngrim OMS login. We will use an isolated browser profile to store authentication cookies, allowing the automation to run unattended after a single manual verification.

## Proposed Changes

### Configuration
#### [NEW] [.env](file:///c:/Users/DSAI/shop_ver20.10/.env)
Create a new `.env` file to store Youngrim credentials securely.
```env
YOUNGRIM_ID=00160003
YOUNGRIM_PW=1234
```

### Automation Scripts
#### [MODIFY] [login_door_yl.py](file:///c:/Users/DSAI/shop_ver20.10/login_door_yl.py)
Refactor the script to:
- **Switch to Microsoft Edge**: Use `msedge.exe` and `EdgeDriver` instead of Avast/Chrome.
- **Session Replication**: Add a utility function to copy cookies and session data from the main Edge profile (`%LOCALAPPDATA%\Microsoft\Edge\User Data\Default`) to the automation folder.
- **Fail-safe Login**: If replication fails or session expires, fallback to ID/PW login.
- Detect 'New Device Authentication' and wait for user.

## Technical Details: Session Replication
To bypass ID/PW entry, we will synchronize the following components from the desktop Edge browser:
1. **Source**: `%LOCALAPPDATA%\Microsoft\Edge\User Data\Default`
2. **Target**: `c:\Users\DSAI\shop_ver20.10\edge_automation_profile\Default`
3. **Core Files**:
    - `Network/Cookies`: Contains login session tokens.
    - `Local Storage/`: Contains site-specific data.
    - `Login Data`: (Encrypted) saved passwords.

## Verification Plan

### Automated Tests
Currently, there are no unit tests for the browser interaction logic. I will verify the script by running it in a "visible" mode first.

### Manual Verification
1. **Initial Run**: Run `python login_door_yl.py`.
2. **Manual Login**: When the browser opens, if it asks for ID/PW, the script should fill them. If it asks for device authentication, I (the user) will complete it manually.
3. **Session Check**: Close the script and run it again. It should navigate directly to the dashboard without asking for credentials or authentication again.
4. **Final Step**: Once verified, I will enable "Headless" mode for silent operation.
