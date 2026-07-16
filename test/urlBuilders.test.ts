import expect from 'expect.js';
import {
  buildAmazonLinkUrl,
  buildEbooksLinkUrl,
  buildKoboLinkUrl,
  buildLibbyLinkUrl,
  buildOverdriveLinkUrl,
} from '../src/utils/urlBuilders.ts';

describe('URL builders', () => {
  const bookData = {
    title: 'The Legend of Sleepy Hollow',
    author: 'Washington Irving',
  };
  const encodedBookData =
    'The%20Legend%20of%20Sleepy%20Hollow+Washington%20Irving';

  describe('buildLibbyLinkUrl', () => {
    it('should build a Libby search URL with the provided library name', () => {
      const url = buildLibbyLinkUrl({ libraryName: 'lincoln', ...bookData });
      expect(url).to.contain('libbyapp.com/search/lincoln/search/query-');
      expect(url).to.contain('Washington%20Irving');
    });

    it('should encode special characters', () => {
      const url = buildLibbyLinkUrl({
        libraryName: 'lincoln',
        title: 'Pride & Prejudice',
        author: 'Jane Austen',
      });
      expect(url).to.contain('libbyapp.com/search/lincoln/search/query-');
      expect(url).not.to.contain(' ');
    });
  });

  describe('buildOverdriveLinkUrl', () => {
    it('should build an Overdrive search URL', () => {
      const url = buildOverdriveLinkUrl(bookData);
      expect(url).to.contain('overdrive.com/search?q=');
      expect(url).to.contain(encodedBookData);
    });
  });

  describe('buildAmazonLinkUrl', () => {
    it('should use the provided Amazon domain', () => {
      const url = buildAmazonLinkUrl({
        amazonDomain: '.co.uk',
        ...bookData,
      });
      expect(url).to.contain('amazon.co.uk/s?k=');
    });

    it('should encode title and author', () => {
      const url = buildAmazonLinkUrl({
        amazonDomain: '.com',
        ...bookData,
      });
      expect(url).to.contain(encodedBookData);
    });
  });

  describe('buildEbooksLinkUrl', () => {
    it('should build an eBooks.com search URL', () => {
      const url = buildEbooksLinkUrl(bookData);
      expect(url).to.contain('ebooks.com/searchapp/searchresults.net?term=');
    });

    it('should encode title and author', () => {
      const url = buildEbooksLinkUrl(bookData);
      expect(url).to.contain(encodedBookData);
    });
  });

  describe('buildKoboLinkUrl', () => {
    it('should build a Kobo search URL', () => {
      const url = buildKoboLinkUrl(bookData);
      expect(url).to.contain('kobo.com/search?query=');
    });

    it('should encode title and author', () => {
      const url = buildKoboLinkUrl(bookData);
      expect(url).to.contain(encodedBookData);
    });
  });
});
