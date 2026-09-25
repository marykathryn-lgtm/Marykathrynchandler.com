#!/usr/bin/env python3
"""Download every remote image used by the site and point the HTML at the local copies.

The Stitch export links its images from Google-hosted URLs (lh3.googleusercontent.com).
Those links may not last, so run this once from a computer with normal internet access:

    python3 scripts/localize_images.py

Images are saved to assets/images/ and every *.html file is rewritten to use them.
It is safe to run again; images that already downloaded are skipped, and any that fail
are left pointing at the original URL.
"""
import argparse
import hashlib
import json
import re
import sys
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
IMG_DIR = ROOT / 'assets' / 'images'
EXT = {
    'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp',
    'image/gif': '.gif', 'image/svg+xml': '.svg', 'image/avif': '.avif',
}


def fetch(url):
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    last = None
    for _ in range(3):
        try:
            with urllib.request.urlopen(req, timeout=30) as r:
                return r.read(), r.headers.get_content_type()
        except Exception as e:  # noqa: BLE001
            last = e
    raise last


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('--prefix', default='https://lh3.googleusercontent.com/',
                    help='only URLs starting with this prefix are downloaded')
    args = ap.parse_args()

    url_re = re.compile(re.escape(args.prefix) + r'[^"\'\s)<>]+')
    pages = sorted(ROOT.glob('*.html'))
    urls = sorted({u for p in pages for u in url_re.findall(p.read_text(encoding='utf-8'))})
    if not urls:
        print('No remote images found - nothing to do.')
        return 0

    IMG_DIR.mkdir(parents=True, exist_ok=True)
    manifest_path = IMG_DIR / 'manifest.json'
    manifest = json.loads(manifest_path.read_text()) if manifest_path.exists() else {}
    mapping, failed = {}, []

    for i, url in enumerate(urls, 1):
        digest = hashlib.sha1(url.encode()).hexdigest()[:10]
        existing = next(iter(IMG_DIR.glob(f'{digest}.*')), None)
        if existing:
            mapping[url] = existing.name
            continue
        try:
            data, ctype = fetch(url)
            if not ctype.startswith('image/'):
                raise ValueError(f'not an image ({ctype})')
            name = digest + EXT.get(ctype, '.jpg')
            (IMG_DIR / name).write_bytes(data)
            mapping[url] = name
            manifest[name] = url
            print(f'[{i}/{len(urls)}] saved {name}')
        except Exception as e:  # noqa: BLE001
            failed.append(url)
            print(f'[{i}/{len(urls)}] FAILED {url[:70]}... ({e})', file=sys.stderr)

    manifest_path.write_text(json.dumps(manifest, indent=2))

    for p in pages:
        text = p.read_text(encoding='utf-8')
        new = url_re.sub(lambda m: f'assets/images/{mapping[m.group(0)]}' if m.group(0) in mapping else m.group(0), text)
        if new != text:
            p.write_text(new, encoding='utf-8')

    print(f'\nDone: {len(mapping)} of {len(urls)} images now local.')
    if failed:
        print(f'{len(failed)} failed and still use the original URL. Run the script again to retry.')
        return 1
    print('You can also remove the "preconnect" line for lh3.googleusercontent.com from each page if you like.')
    return 0


if __name__ == '__main__':
    sys.exit(main())
