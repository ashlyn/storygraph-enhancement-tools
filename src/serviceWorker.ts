import * as browser from 'webextension-polyfill';
import { initializeStorageWithDefaults } from './storage';
import { DEFAULT_LIBRARY_NAME } from './constants/library';
import { DEFAULT_AMAZON_DOMAIN } from './constants/amazon';

const previousMajorVersions = [1];

type UrlBuilder = (previousMajorVersion?: number) => string;
const INSTALL_REASON_URLS: Record<
  browser.runtime.OnInstalledReason,
  UrlBuilder
> = {
  [browser.runtime.OnInstalledReason.INSTALL]: () =>
    'onboarding/onboarding.html',
  [browser.runtime.OnInstalledReason.UPDATE]: (
    previousMajorVersion: number,
  ) => {
    if (previousMajorVersions.includes(previousMajorVersion)) {
      return `onboarding/updates-from-v${previousMajorVersion}.html`;
    }
  },
  [browser.runtime.OnInstalledReason.CHROME_UPDATE]: () => '',
  [browser.runtime.OnInstalledReason.SHARED_MODULE_UPDATE]: () => '',
};

const openNewTab = (url: string) => {
  browser.tabs.create({
    url: url,
  });
};

const searchContextMenuItemId = 'storygraph-search';
const searchContextMenuCreateProperties: browser.contextMenus.CreateProperties =
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
}: browser.runtime.InstalledDetails) => {
  await initializeOptions();

  const previousMajorVersion = parseInt(previousVersion.split('.')[0]);
  const urlBuilder: UrlBuilder | undefined = INSTALL_REASON_URLS[reason];
  if (!urlBuilder) return;

  const url = urlBuilder(previousMajorVersion);
  if (url) openNewTab(url);

  browser.contextMenus.create(searchContextMenuCreateProperties);
};

browser.runtime.onInstalled.addListener(handleOnInstalledEvent);

browser.contextMenus.onClicked.addListener((info) => {
  const { menuItemId, selectionText } = info;
  switch (menuItemId) {
    case searchContextMenuItemId:
      if (!selectionText) return;
      openNewTab(storygraphSearchUrl(selectionText));
      break;
  }
});
