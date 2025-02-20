import { AMAZON_LINK_SELECTOR, EBOOKS_LINK_SELECTOR } from './selectors';

export const BOOK_INFO_CLASSNAME = 'book-title-author-and-series';

export const OWNED_LINK_CLASSNAME = 'remove-from-owned-link';
export const MARK_AS_OWNED_LINK_CLASSNAME = 'mark-as-owned-link';

export const BUY_LINK_CLASSES = 'font-semibold hover:text-cyan-700';
export const AMAZON_LINK_CLASSES = `${AMAZON_LINK_SELECTOR} ${BUY_LINK_CLASSES}`;
export const amazonLinkText = (amazonDomain: string) => `Amazon${amazonDomain}`;

export const EBOOKS_LINK_CLASSES = `${EBOOKS_LINK_SELECTOR} ${BUY_LINK_CLASSES}`;
export const EBOOKS_LINK_TEXT = 'eBooks.com';
