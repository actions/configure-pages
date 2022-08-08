# configure-pages

A GitHub Action to enable Pages and extract various metadata about a site. It can also be used to configure various static site generators we support as [starter workflows][starter-workflows].

See [`set-pages-path.js`](src/set-pages-path.js) for more details on how we configure static site generators to work "out of the box" with GitHub Pages.

# Usage

See [action.yml](action.yml) and the [Pages starter workflows][starter-workflows].

# Release instructions

In order to release a new version of this Action:

1. Locate the semantic version of the [upcoming release][release-list] (a draft is maintained by the [`draft-release` workflow][draft-release])

2. Push a matching tag (e.g.`v0.1.0`) **if** different than the `main` branch (if not, publishing the draft release will create it):

   ```bash
   git tag v0.1.0
   git push origin v0.1.0
   ```

3. Publish the draft release (the major tag such as `v0` will be created/updated by the [`release` workflow][release])

   ⚠️ Environment approval is required. Check the [Release workflow run list][release-workflow-runs].

# License

The scripts and documentation in this project are released under the [MIT License](LICENSE).

<!-- references -->
[starter-workflows]: https://github.com/actions/starter-workflows/tree/main/pages
[release-list]: /releases
[draft-release]: .github/workflows/draft-release.yml
[release]: .github/workflows/release.yml
[release-workflow-runs]: /actions/workflows/release.yml
