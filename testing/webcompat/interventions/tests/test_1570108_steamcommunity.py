import pytest
from helpers import (
    Css,
    Text,
    Xpath,
    assert_not_element,
    await_element,
    await_first_element_of,
    await_getUserMedia_call_on_click,
    find_element,
)

URL = "https://steamcommunity.com/chat"


USERID_CSS = Css("input[type='text'][class*='newlogindialog']")
PASSWORD_CSS = Css("input[type='password'][class*='newlogindialog']")
SIGNIN_CSS = Css("button[type='submit'][class*='newlogindialog']")
GEAR_CSS = Css(".friendListButton")
LOGIN_FAIL_XPATH = Xpath(
    "//*[contains(text(), 'try again') and " "contains(@class, 'FormError')]"
)
AUTH_CSS = Css("[class*='newlogindialog_ProtectingAccount']")
RATE_TEXT = Text("too many login failures")
VOICE_XPATH = Xpath(
    "//*[contains(text(), 'Voice') and "
    "contains(@class, 'pagedsettings_PagedSettingsDialog_PageListItem')]"
)
MIC_BUTTON_CSS = Css("button.LocalMicTestButton")
UNSUPPORTED_TEXT = Text("currently unsupported in Firefox")


def load_mic_test(session, credentials):
    session.get(URL)

    userid = await_element(session, USERID_CSS)
    password = find_element(session, PASSWORD_CSS)
    submit = find_element(session, SIGNIN_CSS)
    assert userid.is_displayed()
    assert password.is_displayed()
    assert submit.is_displayed()

    userid.send_keys(credentials["username"])
    password.send_keys(credentials["password"])
    submit.click()

    while True:
        [gear, fail, auth, rate] = await_first_element_of(
            session,
            [GEAR_CSS, LOGIN_FAIL_XPATH, AUTH_CSS, RATE_TEXT],
            is_displayed=True,
            timeout=20,
        )
        if rate:
            pytest.skip(
                "Too many Steam login attempts detected in a short time; try again later."
            )
            return None
        elif auth:
            pytest.skip("Two-factor authentication requested; disable Steam Guard.")
            return None
        elif fail:
            pytest.skip("Invalid login provided.")
            return None
        else:
            break
    assert gear
    gear.click()

    voice = await_element(session, VOICE_XPATH)
    assert voice.is_displayed()
    voice.click()

    mic_test = await_element(session, MIC_BUTTON_CSS)
    assert mic_test.is_displayed()

    return mic_test


@pytest.mark.with_interventions
def test_enabled(session, credentials):
    mic_test = load_mic_test(session, credentials)
    if not mic_test:
        return

    await_getUserMedia_call_on_click(session, mic_test)

    assert_not_element(session, UNSUPPORTED_TEXT)


@pytest.mark.without_interventions
def test_disabled(session, credentials):
    mic_test = load_mic_test(session, credentials)
    if not mic_test:
        return

    mic_test.click()

    unsupported = await_element(session, UNSUPPORTED_TEXT)
    assert unsupported.is_displayed()
