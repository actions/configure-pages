# configure-pages

A GitHub Action to enable Pages and extract various metadata about a site. It can also be used to configure various static site generators we support as [starter workflows][starter-workflows].

See [`set-pages-config.js`](src/set-pages-config.js) for more details on how we configure static site generators to work "out of the box" with GitHub Pages.

# Usage

See [action.yml](action.yml) and the [Pages starter workflows][starter-workflows].

# Release instructions

In order to release a new version of this Action:

1. Locate the semantic version of the [upcoming release][release-list] (a draft is maintained by the [`draft-release` workflow][draft-release]).

2. Publish the draft release from the `main` branch with semantic version as the tag name, _with_ the checkbox to publish to the GitHub Marketplace checked. :ballot_box_with_check:

3. After publishing the release, the [`release` workflow][release] will automatically run to create/update the corresponding the major version tag such as `v0`.

   ⚠️ Environment approval is required. Check the [Release workflow run list][release-workflow-runs].

# License

The scripts and documentation in this project are released under the [MIT License](LICENSE).

<!-- references -->
[starter-workflows]: https://github.com/actions/starter-workflows/tree/main/pages
[release-list]: https://github.com/actions/configure-pages/releases
[draft-release]: .github/workflows/draft-release.yml
[release]: .github/workflows/release.yml
[release-workflow-runs]: https://github.com/actions/configure-pages/actions/workflows/release.yml
