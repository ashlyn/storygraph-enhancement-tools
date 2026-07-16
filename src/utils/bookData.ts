import { BOOK_INFO_CLASSNAME } from '../constants/linkData.ts';
import { BookData } from '../constants/types/bookData.ts';
import { BookPane } from '../constants/types/bookPane.ts';

export const getBookData = (bookPane: BookPane): BookData => {
  const pane = bookPane.getElementsByClassName(
    BOOK_INFO_CLASSNAME,
  )[0] as HTMLElement;
  const nonRelevantText = [...pane.getElementsByClassName('sr-only')].map(
    (sr) => (sr as HTMLElement).innerText.trim(),
  );
  const info = pane.innerText
    .split('\n')
    .map((data) => data.trim())
    .filter((data) => data && !nonRelevantText.includes(data));
  const titleIndex = info.length > 2 ? 1 : 0;
  const title = info[titleIndex];
  const author = sanitizeAuthor(getAuthorFromParts(info));
  return {
    title: title.trim(),
    author: author.trim(),
  };
};

const getAuthorFromParts = (parts: string[]): string => {
  if (parts.length === 2) return parts[1];
  const otherContributors = parts.findIndex((part) => part.startsWith('with'));
  if (otherContributors > -1) return parts[otherContributors - 1];
  return parts.length === 3 ? parts[2] : parts[1];
};

const sanitizeAuthor = (author: string): string =>
  author.split(',')[0].split('with ')[0].trim();
