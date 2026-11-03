# Trainova Fit — Download Page

Download page for the Trainova Fit Android app, hosted on GitHub Pages.
A capstone project by BSIT 4 students, Polytechnic University of the Philippines – Lopez Branch.

**Download:** https://trainova-fit.github.io/trainova-fit-release/

## Publish the page (once)
1. In the `trainova-fit` organization, create a **public** repo named `trainova-fit-release` and upload `index.html` (all images are built into it).
2. Settings → Pages → Source: *Deploy from a branch* → `main` / `(root)` → Save.
3. The `CONFIG` block near the bottom of `index.html` is already set to `trainova-fit` / `trainova-fit-release`. You only change it if the repo is renamed.
4. Wait a minute, then open `https://trainova-fit.github.io/trainova-fit-release/`.
5. The poster QR (`trainova-fit-qr.png`) already points to that page URL.

## Ship a new version
The page reads the latest published GitHub release by itself (version, size and "What's new"). Nothing in `index.html` changes per release.
1. **Build** a signed release APK with the same keystore every time. Keep the keystore out of this repo. Rename the file to exactly `trainova-fit.apk`.
2. **Publish** a release: tag `vX.Y.Z`, attach `trainova-fit.apk`, and write the notes. Put the bullets users should see first, then a line that is exactly `---`, then the SHA-256, size and "Requires Android 10 and above". The page shows only the text above `---`. Publish it as a normal release, not a draft or pre-release.
3. **Test** that the page now shows the Download button, the new version, the size and the notes, and that the button downloads the APK. To pull a bad release, mark it as a pre-release. The page then goes back to the previous release (or "Coming soon" if there is none).

How the page behaves:
- No published release, or a release without `trainova-fit.apk`: the button says "Coming soon".
- Release found: the button opens, with the version, the size (decimal MB) and the notes.
- GitHub can't be reached (rate limit, offline): the button still downloads the latest APK; version, size and notes are hidden.

The download button always points to
`https://github.com/trainova-fit/trainova-fit-release/releases/latest/download/trainova-fit.apk`.

## Download counts
Total downloads per release (useful for the results chapter):
`https://api.github.com/repos/trainova-fit/trainova-fit-release/releases` → `assets[].download_count`

## Never commit
Keystore (`*.jks`, `*.keystore`), `key.properties`, `google-services.json`, `.env`, API keys.

## Review mode
Open the page with `#review` at the end of the URL to highlight text that still needs confirming.
