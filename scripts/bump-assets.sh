#!/usr/bin/env bash
# Danh lai version cho tai nguyen frontend de trinh duyet lay ban moi ngay.
# Chay TRUOC moi lan deploy co sua .js/.css:   bash scripts/bump-assets.sh
set -euo pipefail
cd "$(dirname "$0")/.."
python3 - "$(date +%Y%m%d%H%M)" <<'PY'
import re, sys
v = sys.argv[1]

def stamp(m):
    attr, url = m.group(1), m.group(2)
    if url.startswith(('http://', 'https://', '//', 'data:')):
        return m.group(0)
    clean = re.sub(r'\?v=\d+$', '', url)          # bo version cu neu co
    if not clean.startswith('/'):
        clean = '/' + clean                        # tuyet doi, de /ban-ghi/<slug> van nap duoc
    return f'{attr}="{clean}?v={v}"'

p = 'public/index.html'
s = open(p, encoding='utf-8').read()
# Cho phep duoi file kem ?v=... o cuoi
s = re.sub(r'\b(src|href)="([^"]+\.(?:js|css)(?:\?v=\d+)?)"', stamp, s)
open(p, 'w', encoding='utf-8').write(s)

p = 'public/app.js'
s = open(p, encoding='utf-8').read()
s = re.sub(r"fetch\('/vietnam\.geojson(?:\?v=\d+)?'\)", f"fetch('/vietnam.geojson?v={v}')", s)
open(p, 'w', encoding='utf-8').write(s)

print(f"✓ Đã đánh version tài nguyên: {v}")
PY
