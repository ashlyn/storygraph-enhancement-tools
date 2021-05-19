const DEFAULT_LIBRARY_NAME = 'lincoln';
const LIBBY_PLATFORM = 'libby';
const OVERDRIVE_PLATFORM = 'overdrive';
const DEFAULT_LIBRARY_PLATFORM = OVERDRIVE_PLATFORM;

const LIBRARY_NAME_INPUT_SELECTOR = 'library-name';
const STATUS_TEXT_SELECTOR = 'status';
const LIBRARY_LINKS_ENABLED_SELECTOR = 'enable-library-links';
const AMAZON_LINKS_ENABLED_SELECTOR = 'enable-amazon-search';
const AMAZON_DOMAIN_SELECTOR = 'amazon-domain';
const LIBRARY_PLATFORM_INPUTS_SELECTOR = 'input[name=library-platform]';

const EBOOKS_LINKS_ENABLED_SELECTOR = 'enable-ebooks-search';

const BASE_AMAZON_DOMAIN = 'https://amazon';
const DEFAULT_AMAZON_DOMAIN = '.com';
const amazonDomains = [
    {
        groupName: 'Africa',
        options: [
            { value: '.ac', name: 'Ascension Island' },
            { value: '.co.za', name: 'South Africa' },
            { value: '.sh', name: 'Saint Helena' },
        ],
    },
    {
        groupName: 'Americas',
        options: [
            { value: '.ca', name: 'Canada' },
            { value: '.cl', name: 'Chile' },
            { value: '.co', name: 'Columbia' },
            { value: '.com.ar', name: 'Argentina' },
            { value: '.com.br', name: 'Brazil' },
            { value: '.mx', name: 'Mexico' },
            { value: '.us', name: 'United States' },
            { value: '.vc', name: 'Saint Vincent and the Grenadines' },
            { value: '.vg', name: 'British Virgin Islands' },
        ]
    },
    {
        groupName: 'Asia/Oceania',
        options: [
            { value: '.cc', name: 'Cocos (Keeling) Islands' },
            { value: '.co.nz', name: 'New Zealand' },
            { value: '.com.au', name: 'Australia' },
            { value: '.com.sg', name: 'Republic of Singapore' },
            { value: '.fm', name: 'Federated States of Micronesia' },
            { value: '.in', name: 'India' },
            { value: '.jp', name: 'Japan' },
            { value: '.io', name: 'British Indian Ocean Territory' },
            { value: '.qa', name: 'Qatar' },
            { value: '.ru', name: 'Russian Federation' },
        ]
    },
    {
        groupName: 'Europe',
        options: [
            { value: '.be', name: 'Belgium' },
            { value: '.berlin', name: 'City of Berlin in Germany' },
            { value: '.ch', name: 'Switzerland' },
            { value: '.co.uk', name: 'United Kingdom' },
            { value: '.cz', name: 'Czech Republic' },
            { value: '.de', name: 'Germany' },
            { value: '.es', name: 'Spain' },
            { value: '.eu', name: 'European Union' },
            { value: '.fi', name: 'Finland' },
            { value: '.fr', name: 'France' },
            { value: '.gg', name: 'Guernsey' },
            { value: '.im', name: 'Isle of Man' },
            { value: '.it', name: 'Italy' },
            { value: '.me', name: 'Montenegro' },
            { value: '.nl', name: 'The Netherlands' },
            { value: '.ruhr', name: 'Ruhr region, western part of Germany' },
            { value: '.sw', name: 'Sweden' },
            { value: '.wien', name: 'City of Vienna in Austria' },
        ]
    },
];

const HIDDEN_CLASS = 'hidden';

const toggleLibraryLinks = ({ target: { checked }}) => [LIBRARY_NAME_INPUT_SELECTOR, LIBBY_PLATFORM, OVERDRIVE_PLATFORM].forEach(selector => toggleInputDisabledAttribute(!checked, selector));

const toggleLibraryPlatform = ({ target: { checked, value }}) => toggleInputDisabledAttribute(!(checked && value === LIBBY_PLATFORM), LIBRARY_NAME_INPUT_SELECTOR);

const toggleAmazonLinks = ({ target: { checked }}) => toggleInputDisabledAttribute(!checked, AMAZON_DOMAIN_SELECTOR);

const toggleInputDisabledAttribute = (disabled, selector) => {
    const input = document.getElementById(selector);
    if (disabled) {
        input.setAttribute('disabled', 'true');
    } else {
        input.removeAttribute('disabled');
    }
};

const buildAmazonOptions = (selectedDomain) => {
    const defaultOption = new Option('Amazon.com', DEFAULT_AMAZON_DOMAIN, true, selectedDomain === DEFAULT_AMAZON_DOMAIN);
    const groups = amazonDomains.map(({ groupName, options }) => {
        const optGroup = document.createElement('optgroup');
        optGroup.label = groupName;
        const subOptions = options.map(({ value, name }) => new Option(name, value, false, value === selectedDomain));
        optGroup.append(...subOptions);
        return optGroup;
    });
    return [defaultOption, ...groups];
};

const saveOptions = () => {
    const libraryLinksEnabled = document.getElementById(LIBRARY_LINKS_ENABLED_SELECTOR).checked;
    const libraryName = document.getElementById(LIBRARY_NAME_INPUT_SELECTOR).value;

    const libraryPlatform = [...document.querySelectorAll(LIBRARY_PLATFORM_INPUTS_SELECTOR)].find(radio => radio.checked)?.value || DEFAULT_LIBRARY_PLATFORM;

    const amazonSearchLinksEnabled = document.getElementById(AMAZON_LINKS_ENABLED_SELECTOR).checked;
    const selectedAmazonDomain = document.getElementById(AMAZON_DOMAIN_SELECTOR).value || DEFAULT_AMAZON_DOMAIN;

    const ebooksSearchLinksEnabled = document.getElementById(EBOOKS_LINKS_ENABLED_SELECTOR).checked;

    chrome.storage.sync.set({
        librarySettings: {
            libraryLinksEnabled: libraryLinksEnabled,
            libraryPlatform: libraryPlatform,
            libraryName: libraryName,
        },
        amazonSearchSettings: {
            amazonSearchLinksEnabled: amazonSearchLinksEnabled,
            selectedAmazonDomain: selectedAmazonDomain,
        },
        ebooksSearchSettings: { ebooksSearchLinksEnabled: ebooksSearchLinksEnabled, },
    }, () => {
        var status = document.getElementById(STATUS_TEXT_SELECTOR);
        status.textContent = 'Options saved.';
        setTimeout(() => {
            status.textContent = '';
        }, 1500);
    });
};

const updateLibraryNameInputDisplay = (shouldDisplay) => {
    const libraryNameInput = document.getElementById(LIBRARY_NAME_INPUT_SELECTOR);
    if (!shouldDisplay) {
        libraryNameInput.previousElementSibling.classList.add(HIDDEN_CLASS);
        libraryNameInput.classList.add(HIDDEN_CLASS);
    } else {
        libraryNameInput.previousElementSibling.classList.remove(HIDDEN_CLASS);
        libraryNameInput.classList.remove(HIDDEN_CLASS);
    }
};

const restoreOptions = () => {
    chrome.storage.sync.get({
        librarySettings: {
            libraryLinksEnabled: true,
            libraryPlatform: DEFAULT_LIBRARY_PLATFORM,
            libraryName: DEFAULT_LIBRARY_NAME,
        },
        amazonSearchSettings: {
            amazonSearchLinksEnabled: true,
            selectedAmazonDomain: DEFAULT_AMAZON_DOMAIN,
        },
        ebooksSearchSettings: { ebooksSearchLinksEnabled: true, },
    }, ({
            librarySettings: { libraryLinksEnabled, libraryPlatform, libraryName },
            amazonSearchSettings: { amazonSearchLinksEnabled, selectedAmazonDomain },
            ebooksSearchSettings: { ebooksSearchLinksEnabled },
        }) => {
        document.getElementById(LIBRARY_LINKS_ENABLED_SELECTOR).checked = libraryLinksEnabled;
        const libraryNameInput = document.getElementById(LIBRARY_NAME_INPUT_SELECTOR);
        libraryNameInput.value = libraryName;
        libraryNameInput.disabled = !libraryLinksEnabled || libraryPlatform !== LIBBY_PLATFORM;
        updateLibraryNameInputDisplay(libraryPlatform === LIBBY_PLATFORM);

        document.querySelectorAll(LIBRARY_PLATFORM_INPUTS_SELECTOR).forEach(radio => radio.checked = radio.value === libraryPlatform);
        
        document.getElementById(AMAZON_LINKS_ENABLED_SELECTOR).checked = amazonSearchLinksEnabled;

        const amazonOptions = buildAmazonOptions(selectedAmazonDomain);
        const amazonSelect = document.getElementById(AMAZON_DOMAIN_SELECTOR);
        amazonSelect.append(...amazonOptions);
        amazonSelect.disabled = !amazonSearchLinksEnabled;

        document.getElementById(EBOOKS_LINKS_ENABLED_SELECTOR).checked = ebooksSearchLinksEnabled;
    });
};

document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('save').addEventListener('click', saveOptions);

document.getElementById(LIBRARY_LINKS_ENABLED_SELECTOR).addEventListener('change', toggleLibraryLinks);
document.getElementById(AMAZON_LINKS_ENABLED_SELECTOR).addEventListener('change', toggleAmazonLinks);
[...document.querySelectorAll(LIBRARY_PLATFORM_INPUTS_SELECTOR)].forEach(radio => radio.addEventListener('change', (e) => {
    const { checked, value } = e.target;
    toggleLibraryPlatform(e);
    updateLibraryNameInputDisplay(checked && value === LIBBY_PLATFORM);
}));
