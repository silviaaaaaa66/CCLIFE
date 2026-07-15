import os
from email_reader import fetch_audio_attachments
from processor import process_audio
from email_sender import send_email


def main():

    print("Checking mailbox...")

    attachments = fetch_audio_attachments()

    if not attachments:
        print("No new audio files found.")
        return

    for file_path, msg_id, subject in attachments:

        try:
            print(f"Processing: {file_path}")

            # 1. 处理音频
            processed_file = process_audio(file_path, subject)
            
            print(f"Processed: {processed_file}")

            # 2. 发送邮件
            send_email(processed_file)

            print(f"Sent: {processed_file}")

            # 3. 删除原文件 + 处理文件（成功后才删）
            if os.path.exists(file_path):
                os.remove(file_path)
                print(f"Deleted original: {file_path}")

            if os.path.exists(processed_file):
                os.remove(processed_file)
                print(f"Deleted processed: {processed_file}")

        except Exception as e:
            print(f"Failed: {file_path}")