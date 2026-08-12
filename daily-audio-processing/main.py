from batch_audio import process_batch
from email_reader import fetch_audio_attachments


def main():
    print("Checking mailbox...")
    attachments = fetch_audio_attachments()
    if not attachments:
        print("No new email audio files found; checking existing downloads.")
    process_batch()


if __name__ == "__main__":
    main()
