{
    const DEFAULT_LIBRARY_NAME = 'lincoln';

    const BOOK_PANE_SELECTOR = '.book-pane[data-book-id]';

    const LIBBY_LINK_SELECTOR = 'libby-link';
    const LIBBY_LINK_CLASSES = `font-semibold text-xs cursor-pointer ${LIBBY_LINK_SELECTOR}`;
    const LIBBY_LINK_TEXT = 'Library Search';

    const DIVIDER_CLASSES = 'label';
    const DIVIDER_TEXT = '| ';

    const buildLibbyLinkUrl = (libraryName, title, author) => encodeURI(`https://libbyapp.com/search/${libraryName}/search/query-${title} ${author}/page-1`);

    const buildLibbyLinkElement = (libraryName, title, author) => {
        const libbyLink = document.createElement('a');
        libbyLink.className = LIBBY_LINK_CLASSES;
        libbyLink.href = buildLibbyLinkUrl(libraryName, title, author);
        libbyLink.textContent = LIBBY_LINK_TEXT;
        libbyLink.target = '_blank';
        return libbyLink;
    };

    const buildDividerElement = () => {
        const divider = document.createElement('span');
        divider.className = DIVIDER_CLASSES;
        divider.textContent = DIVIDER_TEXT;
        return divider;
    }

    const buildActionLinks = (bookPanes, libraryName) => {
        [...bookPanes].forEach(bookPane => {
            if (bookPane.getElementsByClassName(LIBBY_LINK_SELECTOR).length) return;

            const actionLinks = [...bookPane.getElementsByClassName('book-action-links')][0];
            const title = bookPane.getElementsByTagName('h3')[0].innerText;
            const author = bookPane.getElementsByClassName('mb-1')[0].innerText;

            const divider = buildDividerElement();
            const libbyLink = buildLibbyLinkElement(libraryName, title, author);
            actionLinks.append(divider);
            actionLinks.append(libbyLink);
        });
    };

    const getAllBookPanes = () => document.querySelectorAll(BOOK_PANE_SELECTOR);

    const insertLinks = () => {
        chrome.storage.sync.get({
            libraryName: DEFAULT_LIBRARY_NAME,
        }, ({ libraryName }) => {
            const bookPanes = getAllBookPanes();
            buildActionLinks(bookPanes, libraryName);
        });
    };

    const observeMainContainer = () => {
        const mainContainerElements = document.getElementsByTagName('html')[0];
        const observerConfig = { attributes: false, childList: true, subtree: true };
        const observer = new MutationObserver(insertLinks);
        observer.observe(mainContainerElements, observerConfig);
    };

    insertLinks();
    observeMainContainer();
}
