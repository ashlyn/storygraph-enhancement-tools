# CHANGELOG

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [4.0.0] - 2023-01-18

### Fixed

- Updated all features to match new StoryGraph theming, including new dark mode

## [3.0.0] - 2022-07-21

### Fixed

- Functionality for all links on all screen widths (broken with recent StoryGraph update)

## [2.0.0] - 2021-05-18

### Added

- Ability to switch between Overdrive and Libby library platforms
- Default to Overdrive (requires less configuration, no sign-in to search)
- Onboarding windows for new users and users updating to 2.0.0

## [1.1.0] - 2021-05-12

### Added

- Ability to toggle individual features on/off
- Amazon search links in `Buy` section of all book panes (Amazon storefront is configurable)
- eBooks.com search links in `Buy` section of all book panes

## Fixed

- Occasional `undefined` author in search links

## [1.0.1] - 2021-05-03

### Added

- Make `Library Name` info icon clickable

### Fixed

- Updated link styling (and text to fit) after StoryGraph UI updates
- Options styling conflicts with user agent style sheets

## [1.0.0] - 2021-04-30

### Added

- Initial project manifest
- Generate library search links on all book pane elements
- Implement `MutationObserver` spec so that links are generated for all pages, even after navigation
- Logos, promotional images, other assets
- Github auto-release workflows
- Options panel to configure library name
