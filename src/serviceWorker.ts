// import 'webextension-polyfill';
import { initializeStorageWithDefaults } from './storage';
import { DEFAULT_LIBRARY_NAME } from './constants/library';
import { DEFAULT_AMAZON_DOMAIN } from './constants/amazon';

const { OnInstalledReason } = chrome.runtime;

const previousMajorVersions = [1];

type UrlBuilder = (previousMajorVersion?: number) => string;
const INSTALL_REASON_URLS: Record<
  chrome.runtime.OnInstalledReason,
  UrlBuilder
> = {
  [OnInstalledReason.INSTALL]: () => 'src/onboarding/onboarding.html',
  [OnInstalledReason.UPDATE]: (previousMajorVersion: number) => {
    if (previousMajorVersions.includes(previousMajorVersion)) {
      return `src/onboarding/updates-from-v${previousMajorVersion}.html`;
    }
  },
  [OnInstalledReason.CHROME_UPDATE]: () => '',
  [OnInstalledReason.SHARED_MODULE_UPDATE]: () => '',
};

const openNewTab = (url: string) => {
  chrome.tabs.create({
    url: url,
  });
};

const searchContextMenuItemId = 'storygraph-search';
const searchContextMenuCreateProperties: chrome.contextMenus.CreateProperties =
  {
    contexts: ['selection'],
    enabled: true,
    id: searchContextMenuItemId,
    title: 'Search The StoryGraph',
    visible: true,
  };

const initializeOptions = async () => {
  initializeStorageWithDefaults({
    librarySettings: {
      libraryLinksEnabled: true,
      libraryPlatform: 'overdrive',
      libraryName: DEFAULT_LIBRARY_NAME,
    },
    amazonSearchSettings: {
      amazonSearchLinksEnabled: true,
      selectedAmazonDomain: DEFAULT_AMAZON_DOMAIN,
    },
    ebooksSearchSettings: { ebooksSearchLinksEnabled: true },
  });
};

const storygraphSearchUrl = (searchTerm: string) =>
  `https://app.thestorygraph.com/browse?search_term=${searchTerm}`;
const handleOnInstalledEvent = async ({
  reason,
  previousVersion = '',
}: chrome.runtime.InstalledDetails) => {
  await initializeOptions();

  const previousMajorVersion = parseInt(previousVersion.split('.')[0]);
  const urlBuilder: UrlBuilder | undefined = INSTALL_REASON_URLS[reason];
  if (!urlBuilder) return;

  const url = urlBuilder(previousMajorVersion);
  if (url) openNewTab(url);

  chrome.contextMenus.create(searchContextMenuCreateProperties);
};

chrome.runtime.onInstalled.addListener(handleOnInstalledEvent);

chrome.contextMenus.onClicked.addListener((info) => {
  const { menuItemId, selectionText } = info;
  switch (menuItemId) {
    case searchContextMenuItemId:
      if (!selectionText) return;
      openNewTab(storygraphSearchUrl(selectionText));
      break;
  }
});
