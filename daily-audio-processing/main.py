import argparse

from cclife_audio.batch import process_batch
from cclife_audio.email_reader import fetch_audio_attachments


def main(argv=None):
    parser = argparse.ArgumentParser(
        description="Fetch email audio or process audio already in runtime/downloads/"
    )
    parser.add_argument(
        "--local",
        action="store_true",
        help="Skip email fetching and process audio already in runtime/downloads/",
    )
    args = parser.parse_args(argv)

    if args.local:
        print("Using audio already in runtime/downloads/.")
    else:
        print("Checking mailbox...")
        attachments = fetch_audio_attachments()
        if not attachments:
            print("No new email audio files found; checking runtime/downloads/.")

    process_batch()


if __name__ == "__main__":
    main()
