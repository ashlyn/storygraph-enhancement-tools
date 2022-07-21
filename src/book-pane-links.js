{
    const DEFAULT_LIBRARY_NAME = 'lincoln';
    const LIBBY_PLATFORM = 'libby';
    const OVERDRIVE_PLATFORM = 'overdrive';
    const DEFAULT_LIBRARY_PLATFORM = OVERDRIVE_PLATFORM;

    const BOOK_PANE_SELECTOR = '.book-pane[data-book-id]';

    const ACTION_LINK_SELECTOR = 'book-action-links';
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

    const buildLibbyLinkUrl = ({ libraryName, title, author }) => encodeURI(`https://libbyapp.com/search/${libraryName}/search/query-${title} ${author}/page-1`);
    const buildOverdriveLinkUrl = ({ title, author}) => encodeURI(`https://overdrive.com/search?q=${title}+${author}`);
    const buildAmazonLinkUrl = ({ amazonDomain, title, author }) => encodeURI(`https://amazon${amazonDomain}/s?k=${title}+${author}`);
    const buildEbooksLinkUrl = ({ title, author }) => encodeURI(`https://www.ebooks.com/searchapp/searchresults.net?term=${title}+${author}`);

    const buildLinkElement = ({ url, text, classNames }) => {
        const linkElement = document.createElement('a');
        linkElement.className = classNames;
        linkElement.href = url;
        linkElement.textContent = text;
        linkElement.target = '_blank';
        return linkElement;
    };

    const getBookData = (bookPane) => {
        const title = bookPane.getElementsByTagName('h3')[0].innerText;
        const author = bookPane.getElementsByClassName('mb-1 text-xs')[0].innerText;
        return {
            title: title,
            author: author,
        };
    }

    const libraryLinkBuilder = {
        [LIBBY_PLATFORM]: buildLibbyLinkUrl,
        [OVERDRIVE_PLATFORM]: buildOverdriveLinkUrl,
    };

    const appendLibraryLink = (bookPane, { libraryPlatform, libraryName }, bookData) => {
        const linkBuilder = libraryLinkBuilder[libraryPlatform];
        const libbyLink = buildLinkElement({
            url: linkBuilder({ libraryName: libraryName, ...bookData }),
            text: LIBBY_LINK_TEXT,
            classNames: LIBBY_LINK_CLASSES,
        });

        [...bookPane.getElementsByClassName(ACTION_LINK_SELECTOR)].forEach(links => {
            if (links.getElementsByClassName(LIBBY_LINK_SELECTOR).length) return;
            links.append(libbyLink)
        });
    };

    const appendBuyLink = (bookPane, linkToAppend) => {
        const buyPanes = bookPane.getElementsByClassName(BUY_LINK_SELECTOR);
        const lastBuyLinks = [...buyPanes].map(bp => {
            const paragraphs = bp.getElementsByTagName('p');
            return ({
                before: paragraphs[0],
                parent: paragraphs[0].parentElement,
            });
        });
        lastBuyLinks.forEach(links => {
            if (links.parent.getElementsByClassName(linkToAppend.className).length) return;
            const wrapper = document.createElement('p');
            wrapper.appendChild(linkToAppend.cloneNode(true));
            links.parent.insertBefore(wrapper, links.before);
        });
    };

    const buildAmazonLink = (selectedAmazonDomain, bookData) => {
        return buildLinkElement({
            url: buildAmazonLinkUrl({ amazonDomain: selectedAmazonDomain, ...bookData }),
            text: amazonLinkText(selectedAmazonDomain),
            classNames: AMAZON_LINK_CLASSES,
        });
    }

    const buildEbooksLink = (bookData) => {
        return buildLinkElement({
            url: buildEbooksLinkUrl(bookData),
            text: EBOOKS_LINK_TEXT,
            classNames: EBOOKS_LINK_CLASSES,
        });
    };

    const buildAllLinks = (bookPanes, {
        librarySettings,
        amazonSearchSettings: { amazonSearchLinksEnabled, selectedAmazonDomain },
        ebooksSearchSettings: { ebooksSearchLinksEnabled },
    }) => {
        const { libraryLinksEnabled } = librarySettings;
        if (!libraryLinksEnabled) removeLinks(LIBBY_LINK_SELECTOR);
        if (!amazonSearchLinksEnabled) removeLinks(AMAZON_LINK_SELECTOR);
        if (!ebooksSearchLinksEnabled) removeLinks(EBOOKS_LINK_SELECTOR);

        if (!libraryLinksEnabled &&
            !amazonSearchLinksEnabled &&
            !ebooksSearchLinksEnabled) return;

        [...bookPanes].forEach(bookPane => {
            const bookData = getBookData(bookPane);
            if (libraryLinksEnabled) appendLibraryLink(bookPane, librarySettings, bookData);
            if (amazonSearchLinksEnabled) appendBuyLink(bookPane, buildAmazonLink(selectedAmazonDomain, bookData));
            if (ebooksSearchLinksEnabled) appendBuyLink(bookPane, buildEbooksLink(bookData));
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
                libraryPlatform: DEFAULT_LIBRARY_PLATFORM,
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
