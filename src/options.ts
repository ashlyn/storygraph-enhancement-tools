import 'webextension-polyfill';
import { AmazonDomains, DEFAULT_AMAZON_DOMAIN } from './constants/amazon';
import {
  DEFAULT_LIBRARY_PLATFORM,
  LIBBY_PLATFORM,
  OVERDRIVE_PLATFORM,
} from './constants/library';
import {
  AMAZON_DOMAIN_SELECTOR,
  AMAZON_LINKS_ENABLED_SELECTOR,
  EBOOKS_LINKS_ENABLED_SELECTOR,
  LIBRARY_LINKS_ENABLED_SELECTOR,
  LIBRARY_NAME_INPUT_SELECTOR,
  LIBRARY_PLATFORM_INPUTS_SELECTOR,
  STATUS_TEXT_SELECTOR,
} from './constants/selectors';
import { getStorageData, setStorageData } from './storage';

const HIDDEN_CLASS = 'hidden';

type EventResult = {
  checked: boolean;
  value: string;
};
const toggleLibraryLinks = ({ checked }: EventResult) =>
  [LIBRARY_NAME_INPUT_SELECTOR, LIBBY_PLATFORM, OVERDRIVE_PLATFORM].forEach(
    (selector) => toggleInputDisabledAttribute(!checked, selector),
  );

const toggleLibraryPlatform = ({ checked, value }: EventResult) =>
  toggleInputDisabledAttribute(
    !(checked && value === LIBBY_PLATFORM),
    LIBRARY_NAME_INPUT_SELECTOR,
  );

const toggleAmazonLinks = ({ checked }: EventResult) =>
  toggleInputDisabledAttribute(!checked, AMAZON_DOMAIN_SELECTOR);

const toggleInputDisabledAttribute = (disabled: boolean, selector: string) => {
  const input = getInput(selector);
  if (disabled) {
    input.setAttribute('disabled', 'true');
  } else {
    input.removeAttribute('disabled');
  }
};

const buildAmazonOptions = (selectedDomain: string) => {
  const defaultOption = new Option(
    'Amazon.com',
    DEFAULT_AMAZON_DOMAIN,
    true,
    selectedDomain === DEFAULT_AMAZON_DOMAIN,
  );
  const groups = AmazonDomains.map(({ groupName, options }) => {
    const optGroup = document.createElement('optgroup');
    optGroup.label = groupName;
    const subOptions = options.map(
      ({ value, name }) =>
        new Option(name, value, false, value === selectedDomain),
    );
    optGroup.append(...subOptions);
    return optGroup;
  });
  return [defaultOption, ...groups];
};

const saveOptions = () => {
  const libraryLinksEnabled = getInput(LIBRARY_LINKS_ENABLED_SELECTOR).checked;
  const libraryName = getInput(LIBRARY_NAME_INPUT_SELECTOR).value;

  const libraryPlatform =
    [...getAllInputs(LIBRARY_PLATFORM_INPUTS_SELECTOR)].find(
      (radio) => radio.checked,
    )?.value || DEFAULT_LIBRARY_PLATFORM;

  const amazonSearchLinksEnabled = getInput(
    AMAZON_LINKS_ENABLED_SELECTOR,
  ).checked;
  const selectedAmazonDomain =
    getInput(AMAZON_DOMAIN_SELECTOR).value ?? DEFAULT_AMAZON_DOMAIN;

  const ebooksSearchLinksEnabled = getInput(
    EBOOKS_LINKS_ENABLED_SELECTOR,
  ).checked;

  const status = getInput(STATUS_TEXT_SELECTOR);
  status.textContent = 'Saving...';
  let resultText = '';
  setStorageData({
    librarySettings: {
      libraryLinksEnabled: libraryLinksEnabled,
      libraryPlatform: libraryPlatform,
      libraryName: libraryName,
    },
    amazonSearchSettings: {
      amazonSearchLinksEnabled: amazonSearchLinksEnabled,
      selectedAmazonDomain: selectedAmazonDomain,
    },
    ebooksSearchSettings: {
      ebooksSearchLinksEnabled: ebooksSearchLinksEnabled,
    },
  })
    .then(() => {
      resultText = 'Options saved.';
    })
    .catch((reason) => {
      const errorText = 'Failed to save options.';
      console.error(errorText, reason);
      resultText = errorText;
    })
    .finally(() => {
      status.textContent = resultText;
      setTimeout(() => {
        status.textContent = '';
      }, 1500);
    });
};

const updateLibraryNameInputDisplay = (shouldDisplay: boolean) => {
  const libraryNameInput = document.getElementById(LIBRARY_NAME_INPUT_SELECTOR);
  if (!shouldDisplay) {
    libraryNameInput.previousElementSibling.classList.add(HIDDEN_CLASS);
    libraryNameInput.classList.add(HIDDEN_CLASS);
  } else {
    libraryNameInput.previousElementSibling.classList.remove(HIDDEN_CLASS);
    libraryNameInput.classList.remove(HIDDEN_CLASS);
  }
};

const getInput = (selector: string) => {
  return <HTMLInputElement>document.getElementById(selector);
};

const getAllInputs = (selector: string) => {
  return <NodeListOf<HTMLInputElement>>document.querySelectorAll(selector);
};

const restoreOptions = async () => {
  const {
    librarySettings: { libraryLinksEnabled, libraryPlatform, libraryName },
    amazonSearchSettings: { amazonSearchLinksEnabled, selectedAmazonDomain },
    ebooksSearchSettings: { ebooksSearchLinksEnabled },
  } = await getStorageData();

  getInput(LIBRARY_LINKS_ENABLED_SELECTOR).checked = libraryLinksEnabled;

  const libraryNameInput = getInput(LIBRARY_NAME_INPUT_SELECTOR);
  libraryNameInput.value = libraryName;
  libraryNameInput.disabled =
    !libraryLinksEnabled || libraryPlatform !== LIBBY_PLATFORM;
  updateLibraryNameInputDisplay(libraryPlatform === LIBBY_PLATFORM);

  getAllInputs(LIBRARY_PLATFORM_INPUTS_SELECTOR).forEach(
    (radio) => (radio.checked = radio.value === libraryPlatform),
  );

  getInput(AMAZON_LINKS_ENABLED_SELECTOR).checked = amazonSearchLinksEnabled;

  const amazonOptions = buildAmazonOptions(selectedAmazonDomain);
  const amazonSelect = getInput(AMAZON_DOMAIN_SELECTOR);
  amazonSelect.append(...amazonOptions);
  amazonSelect.disabled = !amazonSearchLinksEnabled;

  getInput(EBOOKS_LINKS_ENABLED_SELECTOR).checked = ebooksSearchLinksEnabled;
};

document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('save').addEventListener('click', saveOptions);

document
  .getElementById(LIBRARY_LINKS_ENABLED_SELECTOR)
  .addEventListener('change', (e) =>
    toggleLibraryLinks(<HTMLInputElement>e.target),
  );
document
  .getElementById(AMAZON_LINKS_ENABLED_SELECTOR)
  .addEventListener('change', (e) =>
    toggleAmazonLinks(<HTMLInputElement>e.target),
  );

getAllInputs(LIBRARY_PLATFORM_INPUTS_SELECTOR).forEach((radio) =>
  radio.addEventListener('change', (e) => {
    const result = <HTMLInputElement>e.target;
    const { checked, value } = result;
    toggleLibraryPlatform(result);
    updateLibraryNameInputDisplay(checked && value === LIBBY_PLATFORM);
  }),
);
