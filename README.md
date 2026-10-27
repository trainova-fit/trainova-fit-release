# Trainova Fit — Download Page

Download page for the Trainova Fit Android app, hosted on GitHub Pages.
A capstone project by BSIT 4 students, Polytechnic University of the Philippines – Lopez Branch.

**Download:** https://trainova-fit.github.io/trainova-fit-release/

## Publish the page (once)
1. In the `trainova-fit` organization, create a **public** repo named `trainova-fit-release` and upload `index.html` (all images are built into it).
2. Settings → Pages → Source: *Deploy from a branch* → `main` / `(root)` → Save.
3. The `CONFIG` block near the bottom of `index.html` is already set to `trainova-fit` / `trainova-fit-release`.
4. Wait a minute, then open `https://trainova-fit.github.io/trainova-fit-release/`.
5. The poster QR (`trainova-fit-qr.png`) already points to that page URL.

## Ship a new version
1. Bump `versionCode` and `versionName` in `android/app/build.gradle`.
2. Build a **signed release APK** with the **same keystore every time**. Keep the keystore out of this repo.
3. Rename the file to exactly `trainova-fit.apk`.
4. Get its checksum: `sha256sum trainova-fit.apk` (Windows: `certutil -hashfile trainova-fit.apk SHA256`).
5. Releases → *Draft a new release* → tag `v1.0.0` → attach `trainova-fit.apk` → paste the checksum and a short "What's new" in the notes → Publish.
6. Update `version` and `size` in the `CONFIG` block of `index.html`.

The download button always points to
`https://github.com/trainova-fit/trainova-fit-release/releases/latest/download/trainova-fit.apk`,
so it serves the newest release without editing links.

## Download counts
Total downloads per release (useful for the results chapter):
`https://api.github.com/repos/trainova-fit/trainova-fit-release/releases` → `assets[].download_count`

## Never commit
Keystore (`*.jks`, `*.keystore`), `key.properties`, `google-services.json`, `.env`, API keys.

## Review mode
Open the page with `#review` at the end of the URL to highlight text that still needs confirming.
