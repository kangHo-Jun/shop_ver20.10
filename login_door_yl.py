import os
import time
import subprocess
from dotenv import load_dotenv
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager

# Load Environment Variables
load_dotenv()

# Targets
LOGIN_URL = "http://door.yl.co.kr"
USER_ID = os.getenv("YOUNGRIM_ID", "00160003")
USER_PW = os.getenv("YOUNGRIM_PW", "1234")

# Possible Avast Browser Paths
AVAST_PATHS = [
    r"C:\Program Files (x86)\AVAST Software\Browser\Application\AvastBrowser.exe",
    r"C:\Program Files\AVAST Software\Browser\Application\AvastBrowser.exe",
    r"C:\Users\{}\AppData\Local\AVAST Software\Browser\Application\AvastBrowser.exe".format(os.getlogin())
]

def find_avast_binary():
    for path in AVAST_PATHS:
        if os.path.exists(path):
            return path
    return None

def kill_browser():
    """Force closes existing Avast Browser instances to unlock the profile."""
    print("Closing existing Avast Browser instances...")
    try:
        subprocess.run(["taskkill", "/F", "/IM", "AvastBrowser.exe"], 
                       stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        time.sleep(2) 
    except Exception as e:
        print(f"Warning during kill: {e}")

def launch_browser(binary_path):
    """Launches Avast Browser with remote debugging and specific profile."""
    # Use a LOCAL isolation profile to avoid locks with the main browser
    profile_dir = os.path.join(os.getcwd(), "avast_automation_profile")
    if not os.path.exists(profile_dir):
        os.makedirs(profile_dir)
        
    cmd = [
        binary_path,
        f"--remote-debugging-port=9222",
        f"--user-data-dir={profile_dir}",
        "--no-first-run",
        "--no-default-browser-check",
        # "--window-position=9999,9999", # Uncomment to hide window after verification
        LOGIN_URL
    ]
    
    print(f"Launching Avast Browser from: {binary_path}")
    print(f"Profile (Isolated): {profile_dir}")
    
    # Launch as a separate process
    return subprocess.Popen(cmd)

def handle_login(driver):
    """Automates ID/PW input and detects authentication requirement."""
    try:
        # Wait for either Login form or Main page
        wait = WebDriverWait(driver, 10)
        
        # 1. Check if we are already logged in
        if "login" not in driver.current_url.lower() and "main" in driver.current_url.lower():
            print("Already logged in. Skipping login step.")
            return True

        # 2. Try to find login fields
        try:
            id_field = wait.until(EC.presence_of_element_located((By.NAME, "userid")))
            pw_field = driver.find_element(By.NAME, "passwd")
            
            print(f"Inputting credentials for ID: {USER_ID}...")
            id_field.clear()
            id_field.send_keys(USER_ID)
            pw_field.clear()
            pw_field.send_keys(USER_PW)
            
            # Click Login button (Usually an image or submit button)
            login_btn = driver.find_element(By.CSS_SELECTOR, "a[href*='login_action']")
            login_btn.click()
            time.sleep(2)
        except Exception:
            print("Login fields not found or already past login. Checking for Auth page...")

        # 3. Detect "New Device/Environment Authentication"
        # This is a placeholder for the actual selector once identified
        if "auth" in driver.current_url.lower() or "certify" in driver.page_source.lower():
            print("\n" + "!"*50)
            print(" [보안 알림] 새로운 기기/환경 인증이 필요합니다.")
            print(" 브라우저에서 인증(SMS/이메일 등)을 완료한 후, 이 창에서 [Enter]를 눌러주세요.")
            print("!"*50)
            input("인증 완료 후 Enter...")
            return True

        return True
    except Exception as e:
        print(f"Login error: {e}")
        return False

def main():
    binary_path = find_avast_binary()
    if not binary_path:
        print("ERROR: Could not find Avast Secure Browser executable.")
        return

    # 1. Kill existing instances
    kill_browser()

    # 2. Launch browser with debug port
    process = launch_browser(binary_path)
    
    # 3. Wait & Connect Loop
    print("Waiting for browser to initialize...")
    driver = None
    
    for attempt in range(3):
        try:
            time.sleep(5)
            print(f"Connection attempt {attempt+1}/3...")
            
            options = Options()
            options.add_experimental_option("debuggerAddress", "127.0.0.1:9222")
            
            service = Service(ChromeDriverManager().install())
            driver = webdriver.Chrome(service=service, options=options)
            print("Successfully connected to Avast Browser.")
            break
        except Exception as e:
            print(f"Connection failed: {e}")
            if attempt == 2:
                print("Could not connect after 3 attempts. Aborting.")
                # Kill the process we spawned if we can't control it
                process.kill() 
                return

    # 4. Connected - Proceed
    try:
        # Step 4: Handle Login & Authentication Transfer
        if not handle_login(driver):
            print("Login failed or cancelled.")
            return

        # Step 5: Navigate to Ledger List
        list_url = "http://door.yl.co.kr/oms/ledger_list.jsp"
        driver.get(list_url)
        print(f"Navigated to List: {list_url}")
        time.sleep(3)
        
        # Final Verification of Login
        if "login" in driver.current_url.lower():
            print("Still stuck at login. Please manual login once.")
            input("Manual login and press Enter...")
            driver.get(list_url)
            time.sleep(3)
        
        print("Login environment is ready. Session saved to profile.")
        print("You can now run the automation unattended in the future.")
        
        # 7. Scrape Transactions
        print("Scraping transaction list...")
        transactions = []
        try:
            # Find all rows text first to avoid stale elements
            tbody = driver.find_element(By.CSS_SELECTOR, "table.table tbody")
            rows = tbody.find_elements(By.TAG_NAME, "tr")
            
            for row in rows:
                try:
                    cols = row.find_elements(By.TAG_NAME, "td")
                    if len(cols) < 6: continue
                    
                    date_text = cols[0].text.strip() # "25-12-11"
                    chulhano = cols[1].text.strip()  # "2512110277"
                    
                    if not chulhano: continue # Skip summary rows
                    
                    # Filter Date (>= 25-12-11)
                    # String comparison works for YY-MM-DD
                    if date_text >= "25-12-11":
                        transactions.append({
                            "date": date_text,
                            "chulhano": chulhano
                        })
                except Exception as e:
                    continue # Skip bad row
        except Exception as e:
            print(f"Error scraping list: {e}")
            
        print(f"Found {len(transactions)} transactions to process.")
        
        # 8. Download Loop
        save_dir = r"C:\Users\DSAI\Desktop\원본"
        if not os.path.exists(save_dir):
            os.makedirs(save_dir)
            
        for idx, item in enumerate(transactions):
            chulhano = item['chulhano']
            date = item['date']
            filename = f"거래명세서_{chulhano}.html"
            save_path = os.path.join(save_dir, filename)
            
            print(f"[{idx+1}/{len(transactions)}] Checking {date} - {chulhano}...")
            
            if os.path.exists(save_path):
                print(f"   Skipping (Already exists): {filename}")
                continue
            
            # Download
            target_url = f"http://door.yl.co.kr/oms/trans_doc.jsp?chulhano={chulhano}&younglim_gubun=임업"
            driver.get(target_url)
            time.sleep(1.5) # Wait for load
            
            html_content = driver.page_source
            if "거래명세서" not in html_content and "로그인" in html_content:
                print("   Logged out? Pausing...")
                input("Login again and press Enter...")
                driver.get(target_url)
                time.sleep(1.5)
                html_content = driver.page_source

            with open(save_path, "w", encoding="utf-8") as f:
                f.write(html_content)
            print(f"   ✅ Saved: {filename}")
            
        print("\n" + "="*50)
        print("✨ All downloads completed!")
        print("="*50)
        print("\nScript finished. Browser window remains open.")
        
    except Exception as e:
        print(f"An error occurred: {e}")
        # If connection failed, we might want to kill the process we started
        # process.kill()

if __name__ == "__main__":
    main()
