# Client snapshot

This directory contains a read-only extraction from the Chinese client research
source. It is intentionally limited to the compact standalone collection runtime
and the client font bundle.

Source paths:

- `assets/resource/standalone_collection/`
- `assets/fonts/`

The snapshot is useful for studying:

- Chinese client font selection and bitmap text assets;
- page geometry, typography, and legacy web runtime behavior;
- JavaScript/native bridge commands used by the standalone collection;
- image and layout conventions that can inform ADV compatibility work.

Account dumps, UID-bound responses, private raw captures, player/server
configuration, APK payloads, native libraries, and the bulk downloaded resource
tree are not stored in Git.

Large publishable binaries are listed in
`release-assets-manifest.json` and distributed separately through GitHub
Releases.
