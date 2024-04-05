import {
  ACTION_MENU_SELECTOR,
  AMAZON_LINK_SELECTOR,
  BUY_LINK_SELECTOR,
  EBOOKS_LINK_SELECTOR,
  LIBRARY_LINK_SELECTOR,
  LIBRARY_LINK_TEXT,
} from './constants/selectors';
import { LibrarySettings, getStorageData, Storage } from './storage';
import {
  AMAZON_LINK_CLASSES,
  BOOK_INFO_CLASSNAME,
  EBOOKS_LINK_CLASSES,
  EBOOKS_LINK_TEXT,
  MARK_AS_OWNED_LINK_CLASSNAME,
  OWNED_LINK_CLASSNAME,
  amazonLinkText,
} from './constants/linkData';

const buildLibbyLinkUrl = ({
  libraryName,
  title,
  author,
}: { libraryName: string } & BookData) =>
  encodeURI(
    `https://libbyapp.com/search/${libraryName}/search/query-${title} ${author}/page-1`,
  );
const buildOverdriveLinkUrl = ({ title, author }: BookData) =>
  encodeURI(`https://overdrive.com/search?q=${title}+${author}`);
const buildAmazonLinkUrl = ({
  amazonDomain,
  title,
  author,
}: { amazonDomain: string } & BookData) =>
  encodeURI(`https://amazon${amazonDomain}/s?k=${title}+${author}`);
const buildEbooksLinkUrl = ({ title, author }: BookData) =>
  encodeURI(
    `https://www.ebooks.com/searchapp/searchresults.net?term=${title}+${author}`,
  );

const buildLinkElement = ({
  url,
  text,
  classNames,
}: {
  url: string;
  text: string;
  classNames: string;
}) => {
  const linkElement = document.createElement('a');
  linkElement.className = classNames;
  linkElement.href = url;
  linkElement.textContent = text;
  linkElement.target = '_blank';
  return linkElement;
};

type BookPane = HTMLElement;

type BookData = {
  title: string;
  author: string;
};
const getBookData = (bookPane: BookPane): BookData => {
  const info = bookPane
    .getElementsByClassName(BOOK_INFO_CLASSNAME)[0]
    .textContent?.split('\n')
    //.innerText.split('\n')
    .map((data) => data.trim())
    .filter((data) => data);
  const title = info[0];
  const author = info.length == 3 ? info[2] : info[1];
  return {
    title: title.trim(),
    author: author.trim(),
  };
};

const libraryLinkBuilder = {
  ['libby']: buildLibbyLinkUrl,
  ['overdrive']: buildOverdriveLinkUrl,
};

const appendLibraryLink = (
  bookPane: BookPane,
  { libraryPlatform, libraryName }: LibrarySettings,
  bookData: BookData,
) => {
  const linkBuilder =
    libraryLinkBuilder[libraryPlatform as keyof typeof libraryLinkBuilder];
  if (!linkBuilder) return;

  const originalContainer = bookPane.getElementsByClassName(
    MARK_AS_OWNED_LINK_CLASSNAME,
  )
    ? bookPane.getElementsByClassName(MARK_AS_OWNED_LINK_CLASSNAME)[0]
        ?.parentElement?.parentElement
    : bookPane.getElementsByClassName(OWNED_LINK_CLASSNAME)[0]?.parentElement
        ?.parentElement;

  if (!originalContainer) return;

  const container = originalContainer.cloneNode(true) as HTMLElement;
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

  [...bookPane.getElementsByClassName(ACTION_MENU_SELECTOR)].forEach(
    (links) => {
      if (links.getElementsByClassName(LIBRARY_LINK_SELECTOR).length) return;
      links
        .getElementsByClassName('mark-as-owned-link')[0]
        .parentElement.parentElement.insertAdjacentElement(
          'beforebegin',
          container,
        );
    },
  );
};

const appendBuyLink = (bookPane: BookPane, linkToAppend: HTMLAnchorElement) => {
  const buyPanes = bookPane.getElementsByClassName(BUY_LINK_SELECTOR);
  const lastBuyLinks = [...buyPanes].map((bp) => {
    const paragraphs = bp.getElementsByTagName('p');
    return {
      before: paragraphs[0],
      parent: paragraphs[0].parentElement,
    };
  });
  lastBuyLinks.forEach((links) => {
    if (links.parent.getElementsByClassName(linkToAppend.className).length)
      return;
    const wrapper = document.createElement('p');
    wrapper.appendChild(linkToAppend.cloneNode(true));
    links.parent.insertBefore(wrapper, links.before);
  });
};

const buildAmazonLink = (selectedAmazonDomain: string, bookData: BookData) => {
  return buildLinkElement({
    url: buildAmazonLinkUrl({
      amazonDomain: selectedAmazonDomain,
      ...bookData,
    }),
    text: amazonLinkText(selectedAmazonDomain),
    classNames: AMAZON_LINK_CLASSES,
  });
};

const buildEbooksLink = (bookData: BookData) => {
  return buildLinkElement({
    url: buildEbooksLinkUrl(bookData),
    text: EBOOKS_LINK_TEXT,
    classNames: EBOOKS_LINK_CLASSES,
  });
};

const buildAllLinks = (
  bookPanes: BookPane[],
  {
    librarySettings,
    amazonSearchSettings: { amazonSearchLinksEnabled, selectedAmazonDomain },
    ebooksSearchSettings: { ebooksSearchLinksEnabled },
  }: Storage,
) => {
  const { libraryLinksEnabled } = librarySettings;
  if (!libraryLinksEnabled) removeLinks(LIBRARY_LINK_SELECTOR);
  if (!amazonSearchLinksEnabled) removeLinks(AMAZON_LINK_SELECTOR);
  if (!ebooksSearchLinksEnabled) removeLinks(EBOOKS_LINK_SELECTOR);

  if (
    !libraryLinksEnabled &&
    !amazonSearchLinksEnabled &&
    !ebooksSearchLinksEnabled
  )
    return;

  [...bookPanes].forEach((bookPane) => {
    const bookData = getBookData(bookPane);
    if (libraryLinksEnabled)
      appendLibraryLink(bookPane, librarySettings, bookData);
    if (amazonSearchLinksEnabled)
      appendBuyLink(bookPane, buildAmazonLink(selectedAmazonDomain, bookData));
    if (ebooksSearchLinksEnabled)
      appendBuyLink(bookPane, buildEbooksLink(bookData));
  });
};

const getAllBookPanes = () =>
  [...document.getElementsByClassName(BOOK_INFO_CLASSNAME)].map(
    (info) => info.parentElement.parentElement,
  );

const removeLinks = (selector: string) => {
  const allLinks = document.getElementsByClassName(selector);
  [...allLinks].forEach((link) => link.remove());
};

const insertLinks = async () => {
  const userSettings = await getStorageData();
  const bookPanes = getAllBookPanes();
  buildAllLinks(bookPanes, userSettings);
};

const observeMainContainer = () => {
  const mainContainerElements = document.getElementsByTagName('html')[0];
  const observerConfig = { attributes: false, childList: true, subtree: true };
  const observer = new MutationObserver(insertLinks);
  observer.observe(mainContainerElements, observerConfig);
};

insertLinks();
observeMainContainer();
