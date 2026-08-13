import argparse
import os
import smtplib
import sys
from datetime import datetime
from email.message import EmailMessage
from pathlib import Path

from dotenv import load_dotenv


BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / ".env")


def env_flag(name, default=False):
    value = os.getenv(name)
    if value is None:
        return default
    return str(value).strip().lower() in {"1", "true", "yes", "on"}


def build_body(system_name, status, message):
    now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    return "\n".join(
        [
            f"발생 시각: {now}",
            f"시스템: {system_name}",
            f"상태: {status}",
            "",
            message,
        ]
    )


def send_email(system_name, status, subject, message):
    smtp_host = os.getenv("ALERT_SMTP_HOST", "").strip()
    smtp_port = int(os.getenv("ALERT_SMTP_PORT", "587"))
    smtp_user = os.getenv("ALERT_SMTP_USERNAME", "").strip()
    smtp_password = os.getenv("ALERT_SMTP_PASSWORD", "").strip()
    mail_to = os.getenv("ALERT_EMAIL_TO", "zartkang@gmail.com").strip()
    mail_from = os.getenv("ALERT_EMAIL_FROM", smtp_user).strip()
    use_starttls = env_flag("ALERT_SMTP_STARTTLS", True)
    use_ssl = env_flag("ALERT_SMTP_SSL", False)

    if not smtp_host:
        return False, "ALERT_SMTP_HOST empty"
    if not mail_to:
        return False, "ALERT_EMAIL_TO empty"
    if not mail_from:
        return False, "ALERT_EMAIL_FROM/ALERT_SMTP_USERNAME empty"
    if not smtp_user or not smtp_password:
        return False, "ALERT_SMTP_USERNAME/ALERT_SMTP_PASSWORD empty"

    email_message = EmailMessage()
    email_message["Subject"] = subject
    email_message["From"] = mail_from
    email_message["To"] = mail_to
    email_message.set_content(build_body(system_name, status, message))

    smtp = None
    try:
        if use_ssl:
            smtp = smtplib.SMTP_SSL(smtp_host, smtp_port, timeout=30)
        else:
            smtp = smtplib.SMTP(smtp_host, smtp_port, timeout=30)
        smtp.ehlo()
        if use_starttls and not use_ssl:
            smtp.starttls()
            smtp.ehlo()
        smtp.login(smtp_user, smtp_password)
        smtp.send_message(email_message)
        return True, f"sent to {mail_to}"
    except Exception as exc:
        return False, str(exc)
    finally:
        if smtp is not None:
            try:
                smtp.quit()
            except Exception:
                pass


def main():
    parser = argparse.ArgumentParser(description="Send alert email for automation failures")
    parser.add_argument("--system", default="영림 자동화")
    parser.add_argument("--status", default="비정상")
    parser.add_argument("--subject", required=True)
    parser.add_argument("--message", required=True)
    args = parser.parse_args()

    ok, detail = send_email(args.system, args.status, args.subject, args.message)
    print(("OK " if ok else "FAIL ") + detail)
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
