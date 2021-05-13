{
    const DEFAULT_LIBRARY_NAME = 'lincoln';

    const BOOK_PANE_SELECTOR = '.book-pane[data-book-id]';

    const LIBBY_LINK_SELECTOR = 'libby-link';
    const LIBBY_LINK_CLASSES = `${LIBBY_LINK_SELECTOR} text-xs cursor-pointer hover:text-cyan-700 border-b`;
    const LIBBY_LINK_TEXT = 'Library';

    const DEFAULT_AMAZON_DOMAIN = '.com';
    const AMAZON_LINK_SELECTOR = 'amazon-link';
    const BUY_LINK_SELECTOR = 'buy-book-pane';
    const AMAZON_LINK_CLASSES = `${AMAZON_LINK_SELECTOR} font-semibold hover:text-cyan-700`;
    const amazonLinkText = (amazonDomain) => `Amazon${amazonDomain}`;

    const buildLibbyLinkUrl = (libraryName, title, author) => encodeURI(`https://libbyapp.com/search/${libraryName}/search/query-${title} ${author}/page-1`);

    const buildLibbyLinkElement = (libraryName, title, author) => {
        const libbyLink = document.createElement('a');
        libbyLink.className = LIBBY_LINK_CLASSES;
        libbyLink.href = buildLibbyLinkUrl(libraryName, title, author);
        libbyLink.textContent = LIBBY_LINK_TEXT;
        libbyLink.target = '_blank';
        return libbyLink;
    };

    const buildAmazonLinkUrl = (amazonDomain, title, author) => encodeURI(`https://amazon${amazonDomain}/s?k=${title}+${author}`);

    const buildAmazonLinkElement = (amazonDomain, title, author) => {
        const amazonLink = document.createElement('a');
        amazonLink.className = AMAZON_LINK_CLASSES;
        amazonLink.href = buildAmazonLinkUrl(amazonDomain, title, author);
        amazonLink.textContent = amazonLinkText(amazonDomain);
        amazonLink.target = '_blank';
        return [document.createElement('br'), amazonLink];
    };

    const getBookData = (bookPane) => {
        const title = bookPane.getElementsByTagName('h3')[0].innerText;
        const author = bookPane.getElementsByClassName('mb-1 mt-1')[0].innerText;
        return {
            title: title,
            author: author,
        };
    }

    const buildLibraryLinks = (bookPanes, libraryName) => {
        [...bookPanes].forEach(bookPane => {
            if (bookPane.getElementsByClassName(LIBBY_LINK_SELECTOR).length) return;

            const actionLinks = bookPane.getElementsByClassName('book-action-links')[0];
            const { title, author } = getBookData(bookPane);

            const libbyLink = buildLibbyLinkElement(libraryName, title, author);
            actionLinks.append(libbyLink);
        });
    };

    const isUsAmazonDomain = (amazonDomain) => amazonDomain === DEFAULT_AMAZON_DOMAIN || amazonDomain === '.us';

    const buildAmazonLinks = (bookPanes, amazonDomain) => {
        [...bookPanes].forEach(bookPane => {
            if (bookPane.getElementsByClassName(AMAZON_LINK_SELECTOR).length) return;

            const buyLinks = bookPane.getElementsByClassName(BUY_LINK_SELECTOR)[0].getElementsByTagName('p')[isUsAmazonDomain(amazonDomain) ? 0 : 1];
            const { title, author } = getBookData(bookPane);

            const amazonLink = buildAmazonLinkElement(amazonDomain, title, author);
            buyLinks.append(...amazonLink);
        });
    };

    const getAllBookPanes = () => document.querySelectorAll(BOOK_PANE_SELECTOR);

    const removeLinks = (selector) => {
        const allLinks = document.getElementsByClassName(selector);
        [...allLinks].forEach(link => link.remove());
    };

    const insertLinks = () => {
        chrome.storage.sync.get({
            librarySettings: {
                libraryLinksEnabled: true,
                libraryName: DEFAULT_LIBRARY_NAME,
            },
            amazonSearchSettings: {
                amazonSearchLinksEnabled: true,
                selectedAmazonDomain: DEFAULT_AMAZON_DOMAIN,
            },
        }, ({ librarySettings: { libraryLinksEnabled, libraryName }, amazonSearchSettings: { amazonSearchLinksEnabled, selectedAmazonDomain }}) => {
            const bookPanes = getAllBookPanes();
            libraryLinksEnabled ? buildLibraryLinks(bookPanes, libraryName) : removeLinks(LIBBY_LINK_SELECTOR);
            amazonSearchLinksEnabled ? buildAmazonLinks(bookPanes, selectedAmazonDomain) : removeLinks(AMAZON_LINK_SELECTOR);
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
