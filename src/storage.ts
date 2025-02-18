import * as browser from 'webextension-polyfill';
import { LibraryPlatform } from './constants/library';

// Define your storage data here
export type LibrarySettings = {
  libraryLinksEnabled: boolean;
  libraryPlatform: LibraryPlatform;
  libraryName: string;
};

type AmazonSearchSettings = {
  amazonSearchLinksEnabled: boolean;
  selectedAmazonDomain: string;
};

type EbooksSearchSettings = {
  ebooksSearchLinksEnabled: boolean;
};

export interface Storage {
  librarySettings: LibrarySettings;
  amazonSearchSettings: AmazonSearchSettings;
  ebooksSearchSettings: EbooksSearchSettings;
}

export async function getStorageData(): Promise<Storage> {
  try {
    return (await browser.storage.sync.get(null)) as Storage;
  } catch (error) {
    console.error('Failed to get storage data', error);
    throw browser?.runtime?.lastError || error;
  }
}

export async function setStorageData(data: Storage): Promise<void> {
  try {
    await browser.storage.sync.set(data);
  } catch (error) {
    console.error('Failed to set storage data', error);
    throw browser?.runtime?.lastError || error;
  }
}

export async function getStorageItem<Key extends keyof Storage>(
  key: Key,
): Promise<Storage[Key]> {
  try {
    return ((await browser.storage.sync.get([key])) as Storage)[key];
  } catch (error) {
    console.error('Failed to get storage item', error);
    throw browser?.runtime?.lastError || error;
  }
}

export async function setStorageItem<Key extends keyof Storage>(
  key: Key,
  value: Storage[Key],
): Promise<void> {
  try {
    await browser.storage.sync.set({ [key]: value });
  } catch (error) {
    console.error('Failed to set storage item', error);
    throw browser?.runtime?.lastError || error;
  }
}

export async function initializeStorageWithDefaults(defaults: Storage) {
  const currentStorageData = await getStorageData();
  const newStorageData = Object.assign({}, defaults, currentStorageData);
  await setStorageData(newStorageData);
}
