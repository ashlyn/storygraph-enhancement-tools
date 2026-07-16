import { BookData } from '../constants/types/bookData.ts';

export const buildLibbyLinkUrl = ({
  libraryName,
  title,
  author,
}: { libraryName: string } & BookData) =>
  encodeURI(
    `https://libbyapp.com/search/${libraryName}/search/query-${title} ${author}/page-1`,
  );

export const buildOverdriveLinkUrl = ({ title, author }: BookData) =>
  encodeURI(`https://overdrive.com/search?q=${title}+${author}`);

export const buildAmazonLinkUrl = ({
  amazonDomain,
  title,
  author,
}: { amazonDomain: string } & BookData) =>
  encodeURI(`https://amazon${amazonDomain}/s?k=${title}+${author}`);

export const buildEbooksLinkUrl = ({ title, author }: BookData) =>
  encodeURI(
    `https://www.ebooks.com/searchapp/searchresults.net?term=${title}+${author}`,
  );

export const buildKoboLinkUrl = ({ title, author }: BookData) =>
  encodeURI(`https://www.kobo.com/search?query=${title}+${author}`);
