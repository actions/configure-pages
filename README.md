# Configure-Pages

An action to enable Pages and extract various metadata about a site. It can also be used to configure various static site generators we support as [starter workflows][starter-workflows].

# Usage

See [action.yml](action.yml) and the [Pages starter workflows][starter-workflows].

# Release instructions

In order to release a new version of this Action:

1. Locate the semantic version of the upcoming release (a draft is maintained by the [`draft-release` workflow][draft-release])

2. Push a matching tag, for instance for `v0.1.0`:

   ```bash
   git tag v0.1.0
   git push origin v0.1.0
   ```

3. Publish the draft release (the major tag such as `v0` will be created/updated by the [`release` workflow][release])

   ⚠️ Environment approval is required.

# License

The scripts and documentation in this project are released under the [MIT License](LICENSE).

<!-- references -->
[starter-workflows]: https://github.com/actions/starter-workflows/tree/main/pages
[draft-release]: .github/workflows/draft-release.yml
[release]: .github/workflows/release.yml