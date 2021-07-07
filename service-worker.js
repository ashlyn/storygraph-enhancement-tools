const { OnInstalledReason } = chrome.runtime;

const previousMajorVersions = [1];

const INSTALL_REASON_URLS = {
    [OnInstalledReason.INSTALL]: () => 'src/onboarding/onboarding.html',
    [OnInstalledReason.UPDATE]: (previousMajorVersion) => {
        if (previousMajorVersions.includes(previousMajorVersion)) {
            return `src/onboarding/updates-from-v${previousMajorVersion}.html`;
        }
    },
};

const openNewTab = (url) => {
    chrome.tabs.create({
        url: url,
    });
};

const handleOnInstalledEvent = ({ reason, previousVersion = '' }) => {
    const previousMajorVersion = parseInt(previousVersion.split('.')[0]);
    const urlBuilder = INSTALL_REASON_URLS[reason];
    if (!urlBuilder) return;

    const url = urlBuilder(previousMajorVersion);
    if (url) openNewTab(url);
};

chrome.runtime.onInstalled.addListener(handleOnInstalledEvent);
