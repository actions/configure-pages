# setup-pages

An action to enable Pages and extract metadata.


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
