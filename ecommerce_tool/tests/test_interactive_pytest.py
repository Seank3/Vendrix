from interactive_test import InteractiveTester


def test_interactive_tester_inits():
    tester = InteractiveTester()
    assert isinstance(tester.integrations, dict)
    expected = {'etsy', 'woocommerce', 'ebay'}
    assert expected.issubset(set(tester.integrations.keys()))
