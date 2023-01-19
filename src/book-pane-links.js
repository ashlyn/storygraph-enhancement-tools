{
    const DEFAULT_LIBRARY_NAME = 'lincoln';
    const LIBBY_PLATFORM = 'libby';
    const OVERDRIVE_PLATFORM = 'overdrive';
    const DEFAULT_LIBRARY_PLATFORM = OVERDRIVE_PLATFORM;

    const BOOK_INFO_CLASSNAME = 'book-title-author-and-series';

    const ACTION_MENU_SELECTOR = 'action-menu';
    const LIBRARY_LINK_SELECTOR = 'library-link';
    const LIBRARY_LINK_TEXT = 'search library';

    const OWNED_LINK_CLASSNAME = 'remove-from-owned-link';
    const MARK_AS_OWNED_LINK_CLASSNAME = 'mark-as-owned-link';

    const BUY_LINK_CLASSES = 'font-semibold hover:text-cyan-700';
    const DEFAULT_AMAZON_DOMAIN = '.com';
    const AMAZON_LINK_SELECTOR = 'amazon-link';
    const BUY_LINK_SELECTOR = 'affiliate-links';
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
        const info = bookPane.getElementsByClassName(BOOK_INFO_CLASSNAME)[0].innerText.split('\n').map(data => data.trim()).filter(data => data);
        const title = info[0];
        const author = info.length == 3 ? info[2] : info[1];
        return {
            title: title.trim(),
            author: author.trim(),
        };
    }

    const libraryLinkBuilder = {
        [LIBBY_PLATFORM]: buildLibbyLinkUrl,
        [OVERDRIVE_PLATFORM]: buildOverdriveLinkUrl,
    };

    const appendLibraryLink = (bookPane, { libraryPlatform, libraryName }, bookData) => {
        const linkBuilder = libraryLinkBuilder[libraryPlatform];

        const originalContainer = bookPane.getElementsByClassName(MARK_AS_OWNED_LINK_CLASSNAME)
            ? bookPane.getElementsByClassName(MARK_AS_OWNED_LINK_CLASSNAME)[0]?.parentElement?.parentElement
            : bookPane.getElementsByClassName(OWNED_LINK_CLASSNAME)[0]?.parentElement?.parentElement;
        
        if (!originalContainer) return;

        const container = originalContainer.cloneNode(true);
        container.removeChild(container.children[1]);
        container.children[0].classList.remove('col-span-2');
        container.children[0].classList.add('col-span-3');
        const link = container.getElementsByTagName('a')[0];
        link.classList.remove(MARK_AS_OWNED_LINK_CLASSNAME);
        link.classList.remove(OWNED_LINK_CLASSNAME);
        link.classList.add(LIBRARY_LINK_SELECTOR);
        link.setAttribute('aria-label', LIBRARY_LINK_TEXT);
        link.title = LIBRARY_LINK_TEXT;
        link.href = linkBuilder({ libraryName: libraryName, ...bookData });
        link.removeAttribute('data-remote');
        link.removeAttribute('rel');
        link.removeAttribute('data-method');
        link.setAttribute('target', '_blank');
        link.getElementsByTagName('span')[0].innerText = LIBRARY_LINK_TEXT;

        [...bookPane.getElementsByClassName(ACTION_MENU_SELECTOR)].forEach(links => {
            if (links.getElementsByClassName(LIBRARY_LINK_SELECTOR).length) return;
            links.getElementsByClassName('mark-as-owned-link')[0].parentElement.parentElement.insertAdjacentElement('beforebegin', container);
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
        if (!libraryLinksEnabled) removeLinks(LIBRARY_LINK_SELECTOR);
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

    const getAllBookPanes = () => [...document.getElementsByClassName(BOOK_INFO_CLASSNAME)].map(info => info.parentElement.parentElement);

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
