import smtplib
from email.message import EmailMessage
import os
from .env_loader import load_dotenv


load_dotenv()

SMTP_SERVER = os.getenv("CCLIFE_SMTP_SERVER", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("CCLIFE_SMTP_PORT", "465"))


def require_env(name):
    value = os.getenv(name)

    if not value:
        raise RuntimeError(f"Missing required environment variable: {name}")

    return value


def send_email(file_path):
    email_address = require_env("CCLIFE_EMAIL")
    password = require_env("CCLIFE_EMAIL_PASSWORD")
    default_to = require_env("CCLIFE_DEFAULT_TO")
    default_cc = os.getenv("CCLIFE_DEFAULT_CC", "")

    msg = EmailMessage()

    filename = os.path.basename(file_path)
    subject = os.path.splitext(filename)[0]

    msg["From"] = email_address
    msg["To"] = default_to
    if default_cc:
        msg["Cc"] = default_cc
    msg["Subject"] = subject

    msg.set_content(
    """
    Hi, 

    Please find the processed audio file attached.

    This message was generated automatically. If you have any questions or encounter any issues with the file, please let me know.

    Best regards,
    Shiyu
    """
    )

    with open(file_path, "rb") as f:
        msg.add_attachment(
            f.read(),
            maintype="audio",
            subtype="mpeg",
            filename=filename
        )

    recipients = [default_to]
    if default_cc:
        recipients.append(default_cc)

    with smtplib.SMTP_SSL(SMTP_SERVER, SMTP_PORT) as smtp:
        smtp.login(email_address, password)
        smtp.send_message(msg, to_addrs=recipients)
