{
    const DEFAULT_LIBRARY_NAME = 'lincoln';

    const BOOK_PANE_SELECTOR = '.book-pane[data-book-id]';

    const LIBBY_LINK_SELECTOR = 'libby-link';
    const LIBBY_LINK_CLASSES = `${LIBBY_LINK_SELECTOR} text-xs cursor-pointer hover:text-cyan-700 border-b`;
    const LIBBY_LINK_TEXT = 'Library';

    const buildLibbyLinkUrl = (libraryName, title, author) => encodeURI(`https://libbyapp.com/search/${libraryName}/search/query-${title} ${author}/page-1`);

    const buildLibbyLinkElement = (libraryName, title, author) => {
        const libbyLink = document.createElement('a');
        libbyLink.className = LIBBY_LINK_CLASSES;
        libbyLink.href = buildLibbyLinkUrl(libraryName, title, author);
        libbyLink.textContent = LIBBY_LINK_TEXT;
        libbyLink.target = '_blank';
        return libbyLink;
    };

    const buildActionLinks = (bookPanes, libraryName) => {
        [...bookPanes].forEach(bookPane => {
            if (bookPane.getElementsByClassName(LIBBY_LINK_SELECTOR).length) return;

            const actionLinks = [...bookPane.getElementsByClassName('book-action-links')][0];
            const title = bookPane.getElementsByTagName('h3')[0].innerText;
            const author = bookPane.getElementsByClassName('mb-1')[0].innerText;

            const libbyLink = buildLibbyLinkElement(libraryName, title, author);
            actionLinks.append(libbyLink);
        });
    };

    const getAllBookPanes = () => document.querySelectorAll(BOOK_PANE_SELECTOR);

    const removeLinks = () => {
        const allLibbyLinks = document.getElementsByClassName(LIBBY_LINK_SELECTOR);
        [...allLibbyLinks].forEach(link => link.remove());
    };

    const insertLinks = () => {
        chrome.storage.sync.get({
            librarySettings: {
                libraryLinksEnabled: true,
                libraryName: DEFAULT_LIBRARY_NAME,
            }
        }, ({ librarySettings: { libraryLinksEnabled, libraryName }}) => {
            if (libraryLinksEnabled) {
                const bookPanes = getAllBookPanes();
                buildActionLinks(bookPanes, libraryName);
            } else {
                removeLinks();
            }
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
