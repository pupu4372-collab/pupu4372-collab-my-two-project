# Stitch: 우리 아이 K-사주 입력 (옵션 추가)

## Stitch Project

- Project ID: `14229546238475315607`
- Screen: `우리 아이 K-사주 입력 (옵션 추가)`
- Screen ID: `1523247aa4964b80bc4f82d7accc6786`

## Code

HTML code download URL:

```text
https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzkxZWY2ZDIyODkxNDQwOWE5YzFkN2Y2Y2QyZjEzZmI1EgsSBxCR6Iuz0gsYAZIBJAoKcHJvamVjdF9pZBIWQhQxNDIyOTU0NjIzODQ3NTMxNTYwNw&filename=&opi=89354086
```

Local path:

```text
docs/stitch/saju-input-screen/index.html
```

## Images

This screen uses **Material Symbols** and CSS color tokens only. There are no hosted raster images in the Stitch HTML export.

Design reference:

- 오행 5색 도트: `wood-green`, `fire-coral`, `earth-sand`, `metal-gold`, `water-navy`
- 플로팅 아이콘: `auto_awesome`, `pets`, `dark_mode`

## Screen highlights (for implementation)

Compared to current `SajuForm.tsx`, the Stitch design adds:

| Feature | Stitch design | Current app |
|---------|---------------|-------------|
| Species | 강아지 / 고양이 / **다른 동물** | 강아지 / 고양이 only |
| Birth time UX | Toggle: 알아요 / 몰라요 | Single dropdown incl. unknown |
| Layout | Card sections + sticky CTA | Single pastel card form |
| Hero | Title + 오행 dots | Simple title/subtitle |

Related doc: `docs/SAJU_INPUT_SCREEN.md`

## Download Script

Run from repository root (PowerShell):

```powershell
New-Item -ItemType Directory -Force "docs\stitch\saju-input-screen" | Out-Null

curl.exe -L "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzkxZWY2ZDIyODkxNDQwOWE5YzFkN2Y2Y2QyZjEzZmI1EgsSBxCR6Iuz0gsYAZIBJAoKcHJvamVjdF9pZBIWQhQxNDIyOTU0NjIzODQ3NTMxNTYwNw&filename=&opi=89354086" -o "docs\stitch\saju-input-screen\index.html"
```

Preview: open `docs/stitch/saju-input-screen/index.html` in a browser.
