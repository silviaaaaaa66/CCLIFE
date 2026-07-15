import os
import logging

from processor import process_audio
from email_sender import send_email

DOWNLOAD_DIR = "downloads"


def main():

    print("Scanning downloads folder...")

    files = []

    for filename in os.listdir(DOWNLOAD_DIR):

        filepath = os.path.join(DOWNLOAD_DIR, filename)

        if not os.path.isfile(filepath):
            continue

        ext = os.path.splitext(filename)[1].lower()


        files.append(filepath)

    if not files:
        print("No audio files found.")
        return

    print(f"Found {len(files)} audio file(s).")

    for file_path in files:

        try:

            print(f"Processing: {file_path}")

            processed_file = process_audio(file_path)

            print(f"Processed: {processed_file}")

            send_email(processed_file)

            print(f"Sent: {processed_file}")

            # 删除原文件
            if os.path.exists(file_path):
                os.remove(file_path)

            # 删除处理后文件
            if os.path.exists(processed_file):
                os.remove(processed_file)

            print(f"Cleaned: {file_path}")

        except Exception as e:

            print(f"Failed: {file_path}")
            print(e)



if __name__ == "__main__":
    main()