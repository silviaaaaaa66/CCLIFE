import unittest

from cclife_audio.processor import to_simplified_chinese


class TranscriptNormalizationTests(unittest.TestCase):
    def test_converts_whisper_traditional_chinese_to_simplified(self):
        transcript = "今日靈修,必得見神,生命專稿,今日經文"

        self.assertEqual(
            to_simplified_chinese(transcript),
            "今日灵修,必得见神,生命专稿,今日经文",
        )


if __name__ == "__main__":
    unittest.main()
