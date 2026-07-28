# Research source status — 2026-07-29

This document records the local/remote state used for the Web ADV research
handoff. Research source directories are treated as read-only unless a future
task explicitly authorizes changes.

## Web ADV implementation

- Local path: `D:\magia\MyProducts\Demo`
- Remote: `HiiragiNemu/MagiaExedraLive2DViewerPersonal`
- Branch: `feature/story-playback-local-complete`
- Verified local and remote commit:
  `91bd93deb880f99841f3503b0e2ee64ace2ebde5`
- Working tree: clean

## Complete game resources and general scenarios

- Local path: `D:\magia\MyProducts\io.kamihama.totentanz`
- Remote: `HiiragiNemu/io.kamihama.totentanz`
- Branch: `main`
- Verified local and remote commit:
  `b04ec29632f561ccc9d514887d98463502a24f3c`
- Working tree: clean

## MagiReader research worktree

- Local path: `D:\magia\MyProducts\magi-reader-exedra-test`
- Remote: `HiiragiNemu/magi-reader`
- Branch: `feature/exedra-cn-and-magireco-voice`
- Remote commit:
  `eebc713f93fa88a67c8a30b7bedfcb5cd102ee10`
- Snapshot at 2026-07-29 02:27 +08:00:
  local `33c4945a1411115d3ad15190662267317099708a`, ahead by one commit,
  working tree clean.

This worktree is actively being changed and amended by a parallel research
task. Earlier in the same audit it contained 1,040 uncommitted/untracked
entries before that task consolidated them. Do not rely on the recorded local
SHA as a stable revision, and do not reset, clean, switch, amend, or bulk-push
this worktree from another task.

## Historical Viewer SP

- Local path: `D:\magia\MyProducts\magireco_viewerSP`
- Remote: `HiiragiNemu/magireco_viewerSP`
- Branch: `master`
- Verified local and remote commit:
  `8d36fb65f55c30ffac793c2465a3d0ec3d9d1781`
- Working tree: clean
- Checkout: complete (49,363 tracked files)

## Chinese client research source

- Read-only source: `D:\magia\MyProducts\MAGIA RECORD CN`
- Source type: non-Git research collection
- Inventory: approximately 52,574 files / 22.08 GiB
- Public staging worktree:
  `D:\magia\MyProducts\MAGIA-RECORD-CN-repo`
- Public remote: `HiiragiNemu/MAGIA-RECORD-CN`

The public repository contains a reviewed compact client snapshot:

- the four Chinese client TrueType fonts and bitmap font;
- standalone collection JavaScript/native bridge logic and its compact UI
  resources;
- the Chinese client story UI atlas, narration/frame images, and ADV tap
  effect;
- a SHA-256 manifest for files above the normal Git file-size limit.

The ten oversized assets in that manifest are published through the
`cn-client-archive-2026-07-29` GitHub Release instead of Git history.

## Permanent public-data exclusions

The following are not public research inputs and must remain excluded:

- player/account dumps and UID-bound data;
- `Full_Raw_Dump_V2`;
- every `private_raw_DO_NOT_UPLOAD` directory;
- decoded player pages and friend/gacha response captures;
- player overrides and server configuration;
- credentials, signing material, tokens, and private keys.

The presence of a file in the read-only source directory is not authorization
to publish it.
