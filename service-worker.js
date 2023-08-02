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

const searchContextMenuItemId = 'storygraph-search';
const searchContextMenuCreateProperties = {
    contexts: ['selection'],
    enabled: true,
    id: searchContextMenuItemId,
    title: 'Search The StoryGraph',
    visible: true,
};

const storygraphSearchUrl = (searchTerm) => `https://app.thestorygraph.com/browse?search_term=${searchTerm}`;

const handleOnInstalledEvent = ({ reason, previousVersion = '' }) => {
    const previousMajorVersion = parseInt(previousVersion.split('.')[0]);
    const urlBuilder = INSTALL_REASON_URLS[reason];
    if (!urlBuilder) return;

    const url = urlBuilder(previousMajorVersion);
    if (url) openNewTab(url);

    chrome.contextMenus.create(searchContextMenuCreateProperties);
};

chrome.runtime.onInstalled.addListener(handleOnInstalledEvent);

chrome.contextMenus.onClicked.addListener(
    (info) => {
        const { menuItemId, selectionText } = info;
        switch (menuItemId) {
            case searchContextMenuItemId:
                if (!selectionText) return;
                openNewTab(storygraphSearchUrl(selectionText));
                break;
        }
    }
);
