import imaplib
import email
import os
import re
from email.header import decode_header
from datetime import datetime, timedelta
from .config import DOWNLOAD_DIR
from .env_loader import load_dotenv


load_dotenv()

IMAP_SERVER = os.getenv("CCLIFE_IMAP_SERVER", "imap.gmail.com")


def require_env(name):
    value = os.getenv(name)

    if not value:
        raise RuntimeError(f"Missing required environment variable: {name}")

    return value


# ----------------------------
# 文件名解码
# ----------------------------
def decode_filename(filename):
    if not filename:
        return None

    decoded_parts = decode_header(filename)
    final_name = ""

    for part, encoding in decoded_parts:
        if isinstance(part, bytes):
            final_name += part.decode(encoding or "utf-8", errors="ignore")
        else:
            final_name += part

    return final_name


# ----------------------------
# 文件名清理：所有符号和空格变成 -
# ----------------------------
def clean_filename(filename):
    name, ext = os.path.splitext(filename)

    # 去掉换行
    name = name.replace("\r", "").replace("\n", "").strip()

    # 除了中文、英文、数字，其余全部变成 -
    name = re.sub(r"[^\u4e00-\u9fa5a-zA-Z0-9]+", "-", name)

    # 多个 - 合并成一个
    name = re.sub(r"-+", "-", name)

    # 去掉开头结尾的 -
    name = name.strip("-")

    return name + ext.lower()


# ----------------------------
# 主函数
# ----------------------------
def fetch_audio_attachments(download_dir=DOWNLOAD_DIR, mark_seen=True):
    os.makedirs(download_dir, exist_ok=True)

    email_address = require_env("CCLIFE_EMAIL")
    password = require_env("CCLIFE_EMAIL_PASSWORD")

    mail = imaplib.IMAP4_SSL(IMAP_SERVER)
    mail.login(email_address, password)
    mail.select("inbox")

    # 7天内未读邮件
    since_date = (datetime.now() - timedelta(days=7)).strftime("%d-%b-%Y")

    status, messages = mail.search(
        None,
        f'(UNSEEN SINCE {since_date})'
    )

    files = []

    if status != "OK":
        return files

    for num in messages[0].split():

        status, msg_data = mail.fetch(num, "(RFC822)")
        if status != "OK":
            continue

        msg = email.message_from_bytes(msg_data[0][1])

        # fallback id
        msg_id = msg.get("Message-ID")
        if not msg_id:
            msg_id = num.decode()

        subject = decode_filename(msg.get("Subject", "")) or ""

        for part in msg.walk():

            if part.get_content_maintype() == "multipart":
                continue

            content_type = part.get_content_type()

            raw_filename = part.get_filename()
            filename = decode_filename(raw_filename)

            # 如果没有文件名
            if not filename:
                ext = content_type.split("/")[-1]
                filename = f"audio_{num.decode()}.{ext}"

            ext = os.path.splitext(filename)[1].lower()

            # ----------------------------
            # 只保留音频
            # ----------------------------
            if not (
                content_type.startswith("audio/")
                or ext in [".mp3", ".wav", ".m4a", ".aac", ".flac", ".ogg", ".wma"]
            ):
                continue

            # 清理文件名
            filename = clean_filename(filename)

            path = os.path.join(download_dir, filename)

            # 保存文件
            with open(path, "wb") as f:
                f.write(part.get_payload(decode=True))

            files.append((path, msg_id, subject))

        # ----------------------------
        # 标记已读，避免重复处理
        # ----------------------------
        if mark_seen:
            mail.store(num, '+FLAGS', '\\Seen')

    mail.logout()

    return files


# ----------------------------
# test
# ----------------------------
if __name__ == "__main__":
    files = fetch_audio_attachments()

    print("Downloaded files:")
    for f in files:
        print(f)
