# Stitch: Pet Fortune Screens (ksajupet Global Design System)

## Stitch Project

- Title: `ksajupet Global Design System`
- Project ID: `11415455600019210963`

## Screens

### Pet Fortune Insights Dashboard

- Requested screen ID: `91212150f37248ca8e94b2024125efde`
- Export screen ID (after `edit_screen` for HTML export): `77a9ad7ff2c84ca181acbf624245ad14`
- HTML download URL:

```text
https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzhjODhmZWMxYmRjNTRmNDZiMGM3NWUyNjMzOWIwNmY3EgsSBxCR6Iuz0gsYAZIBJAoKcHJvamVjdF9pZBIWQhQxMTQxNTQ1NTYwMDAxOTIxMDk2Mw&filename=&opi=96797242
```

Local files:

- HTML: `docs/stitch/pet-fortune-insights-dashboard/index.html`
- Preview: `docs/stitch/pet-fortune-insights-dashboard/preview.png`
- Images: `public/stitch/pet-fortune/dashboard-logo.jpg`

### Pet Fortune Entry Form Card

- Requested screen ID: `c68443e0b5474745bb3120b228a5a197`
- Export screen ID (after `edit_screen` for HTML export): `ba1c464b2c09460a9715a23f06efe194`
- HTML download URL:

```text
https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sX2ZkNmEyMmRhNjk0NTQ1OWVhMWZjYTA0MzU4ODY1MTVkEgsSBxCR6Iuz0gsYAZIBJAoKcHJvamVjdF9pZBIWQhQxMTQxNTQ1NTYwMDAxOTIxMDk2Mw&filename=&opi=96797242
```

Local files:

- HTML: `docs/stitch/pet-fortune-entry-form/index.html`
- Preview: `docs/stitch/pet-fortune-entry-form/preview.png`

## Download Commands

```powershell
curl.exe -L "<dashboard-html-url>" -o docs/stitch/pet-fortune-insights-dashboard/index.html
curl.exe -L "<entry-form-html-url>" -o docs/stitch/pet-fortune-entry-form/index.html
curl.exe -L "<dashboard-logo-url>" -o public/stitch/pet-fortune/dashboard-logo.jpg
```

## Download Notes

- Downloaded with `curl.exe -L`.
- Original screen IDs did not return HTML export URLs; `edit_screen` (no design change) produced exportable copies with new IDs above.
- Dashboard embeds one hosted image (header logo); localized to `/stitch/pet-fortune/dashboard-logo.jpg`.
- Both screens reference `transparenttextures.com` parchment texture in CSS (left as CDN URL, same as other Stitch exports).
- Entry form has no `<img>` tags; decorative frame is pure CSS.

## Design Highlights

- **Dashboard**: harmony score ring, four luck bars (건강운·활력·기쁨·행운), three insight cards, guest login CTA footer.
- **Entry form**: traditional frame card, pet type/name + birth date fields, “사주 보고 내 아이 등록하기” CTA.
