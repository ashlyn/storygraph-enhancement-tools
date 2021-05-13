{
    const DEFAULT_LIBRARY_NAME = 'lincoln';

    const BOOK_PANE_SELECTOR = '.book-pane[data-book-id]';

    const LIBBY_LINK_SELECTOR = 'libby-link';
    const LIBBY_LINK_CLASSES = `${LIBBY_LINK_SELECTOR} text-xs cursor-pointer hover:text-cyan-700 border-b`;
    const LIBBY_LINK_TEXT = 'Library';

    const BUY_LINK_CLASSES = 'font-semibold hover:text-cyan-700';
    const DEFAULT_AMAZON_DOMAIN = '.com';
    const AMAZON_LINK_SELECTOR = 'amazon-link';
    const BUY_LINK_SELECTOR = 'buy-book-pane';
    const AMAZON_LINK_CLASSES = `${AMAZON_LINK_SELECTOR} ${BUY_LINK_CLASSES}`;
    const amazonLinkText = (amazonDomain) => `Amazon${amazonDomain}`;

    const EBOOKS_LINK_SELECTOR = 'ebooks-link';
    const EBOOKS_LINK_CLASSES = `${EBOOKS_LINK_SELECTOR} ${BUY_LINK_CLASSES}`;
    const EBOOKS_LINK_TEXT = 'eBooks.com';

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

    const buildEbooksLinkUrl = (title, author) => encodeURI(`https://www.ebooks.com/searchapp/searchresults.net?term=${title}+${author}`);

    const buildEbooksLinkElement = (title, author) => {
        const ebooksLink = document.createElement('a');
        ebooksLink.className = EBOOKS_LINK_CLASSES;
        ebooksLink.href = buildEbooksLinkUrl(title, author);
        ebooksLink.textContent = EBOOKS_LINK_TEXT;
        ebooksLink.target = '_blank';
        return [document.createElement('br'), ebooksLink];
    };

    const getBookData = (bookPane) => {
        const title = bookPane.getElementsByTagName('h3')[0].innerText;
        const author = bookPane.getElementsByClassName('mb-1 text-xs')[0].innerText;
        return {
            title: title,
            author: author,
        };
    }

    const appendLibraryLink = (bookPane, libraryName, { title, author }) => {
        if (bookPane.getElementsByClassName(LIBBY_LINK_SELECTOR).length) return;

        const actionLinks = bookPane.getElementsByClassName('book-action-links')[0];
        const libbyLink = buildLibbyLinkElement(libraryName, title, author);
        actionLinks.append(libbyLink);
    };

    const isUsAmazonDomain = (amazonDomain) => amazonDomain === DEFAULT_AMAZON_DOMAIN || amazonDomain === '.us';

    const appendAmazonLink = (bookPane, selectedAmazonDomain, { title, author}) => {
        if (bookPane.getElementsByClassName(AMAZON_LINK_SELECTOR).length) return;

        const buyLinks = bookPane.getElementsByClassName(BUY_LINK_SELECTOR)[0].getElementsByTagName('p')[isUsAmazonDomain(selectedAmazonDomain) ? 0 : 1];

        const amazonLink = buildAmazonLinkElement(selectedAmazonDomain, title, author);
        buyLinks.append(...amazonLink);
    };

    const appendEbooksLinks = (bookPane, { title, author }) => {
        if (bookPane.getElementsByClassName(EBOOKS_LINK_SELECTOR).length) return;
        
        const buyLinks = [...bookPane.getElementsByClassName(BUY_LINK_SELECTOR)[0].getElementsByTagName('p')].slice(0, 2);
        
        // append links to both `United States` and `Other countries` category and let eBooks.com handle locale
        const ebooksLink = buildEbooksLinkElement(title, author);
        buyLinks.forEach(link => link.append(...ebooksLink));
    };

    const buildAllLinks = (bookPanes, {
        librarySettings: { libraryLinksEnabled, libraryName },
        amazonSearchSettings: { amazonSearchLinksEnabled, selectedAmazonDomain },
        ebooksSearchSettings: { ebooksSearchLinksEnabled },
    }) => {
        if (!libraryLinksEnabled) removeLinks(LIBBY_LINK_SELECTOR);
        if (!amazonSearchLinksEnabled) removeLinks(AMAZON_LINK_SELECTOR);
        if (!ebooksSearchLinksEnabled) removeLinks(EBOOKS_LINK_SELECTOR);

        if (!libraryLinksEnabled &&
            !amazonSearchLinksEnabled &&
            !ebooksSearchLinksEnabled) return;

        [...bookPanes].forEach(bookPane => {
            const bookData = getBookData(bookPane);
            if (libraryLinksEnabled) appendLibraryLink(bookPane, libraryName, bookData);
            if (amazonSearchLinksEnabled) appendAmazonLink(bookPane, selectedAmazonDomain, bookData);
            if (ebooksSearchLinksEnabled) appendEbooksLinks(bookPane, bookData);
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
            ebooksSearchSettings: { ebooksSearchLinksEnabled: true, },
        }, (userSettings) => {
            const bookPanes = getAllBookPanes();
            buildAllLinks(bookPanes, userSettings);
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
