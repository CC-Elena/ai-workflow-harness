import unittest
from service import assign_flag


class FlagTest(unittest.TestCase):
    def test_assignment_is_stable(self):
        self.assertEqual(assign_flag("user-42"), assign_flag("user-42"))

    def test_boundaries(self):
        self.assertFalse(assign_flag("any", 0))
        self.assertTrue(assign_flag("any", 100))
        with self.assertRaises(ValueError):
            assign_flag("any", 101)


if __name__ == "__main__":
    unittest.main()
