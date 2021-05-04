const DEFAULT_LIBRARY_NAME = 'lincoln';
const LIBRARY_NAME_INPUT_SELECTOR = 'library-name';
const STATUS_TEXT_SELECTOR = 'status';

const saveOptions = () => {
    var libraryName = document.getElementById(LIBRARY_NAME_INPUT_SELECTOR).value;
    chrome.storage.sync.set({
        libraryName: libraryName,
    }, () => {
        var status = document.getElementById(STATUS_TEXT_SELECTOR);
        status.textContent = 'Options saved.';
        setTimeout(() => {
            status.textContent = '';
        }, 1500);
    });
};

const restoreOptions = () => {
    chrome.storage.sync.get({
        libraryName: DEFAULT_LIBRARY_NAME,
    }, ({ libraryName }) => {
        document.getElementById(LIBRARY_NAME_INPUT_SELECTOR).value = libraryName;
    });
};

document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('save').addEventListener('click', saveOptions);
