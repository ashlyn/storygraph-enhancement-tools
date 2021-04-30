# The StoryGraph Enhancement Suite

This repo contains the code and promotional materials for a Chrome browser extension that enhances the UI of [The StoryGraph](https://app.thestorygraph.com/). The primary feature is a `Library Search` link inserted into various views that when clicked, will take a user directly to search results for ebooks and audiobooks available at their local library through the Libby platform. In the future, other enhancements, such as direct ebook purchase links may be added.

## Settings

After installing the extension locally or through the Chrome extension web store (coming soon), clicking the icon in the extensions menu will bring up the settings window. There is currently a single user setting, which is used to correctly create the Libby library links. To find out what your library name is, log into [Libby](https://libbyapp.com/), click the `Search` option, and see the library name in the URL bar (`libbyapp.com/search/<your library name>`).

## Contribution

To contribute to this browser extension, clone the repo, then follow the [tutorial for loading an unpacked extension](https://developer.chrome.com/docs/extensions/mv3/getstarted/#manifest) in your browser. Navigate to [The StoryGraph](https://app.thestorygraph.com/) to debug. Please file issues or feature requests as Github issues.

### Future Enhancements

- Direct ebook purchase links
- [Internationalization](https://developer.chrome.com/docs/extensions/reference/i18n/#how-to-support-multiple-languages) of settings UI and links in StoryGraph
