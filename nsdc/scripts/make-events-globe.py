#!/usr/bin/env python3
"""Build the Events-page photo globe from the canonical OrbGallery source.

Run from nsdc/:  python3 scripts/make-events-globe.py  (needs Pillow + network)

- Fetches https://threeui.com/source-code/orb-gallery.json and refuses to
  continue unless its SHA-256 starts with fff1d451248b.
- Replaces the 96-tile generated-UI atlas with cover-cropped WebP tiles made
  from the 11 full-resolution NSDC event photographs in public/ (shuffled
  with a fixed seed; the scene's own clash-avoidance spreads repeats apart).
- Rethemes the frame background to #08070D and hides the marketing overlays
  (nodes stay in the DOM — the scene queries them for sizing).
- Geometry, shaders, animation, drag inertia, hover/focus dimming and the
  loading logic are never touched.
"""
import base64
import hashlib
import io
import json
import random
import re
import sys
import urllib.request
from pathlib import Path

NSDC = Path(__file__).resolve().parent.parent
OUT = NSDC / "src/threeui-events/sources/orb-gallery-events.html"
SRC_URL = "https://threeui.com/source-code/orb-gallery.json"
SRC_SHA = "fff1d451248b"
TW, TH, TILES, SEED = 384, 256, 96, 20260214

# All 11 full-resolution NSDC event photographs (see inventory in README notes).
# The 320x240 secret-pathways thumbnails are lower-quality duplicates of the
# same events and are intentionally excluded; college/* are generic campus
# stock, brands/* are logos.
PHOTOS = [
    "public/events/hackops.webp",
    "public/events/technograd.webp",
    "public/globe/previous/design-dojo.jpg",
    "public/globe/previous/inauguration.jpg",
    "public/globe/previous/synergy.jpg",
    "public/globe/previous/technograd.jpg",
    "public/globe/seminar-audience.jpg",
    "public/globe/seminar-session.jpg",
    "public/globe/technograd-audience.jpg",
    "public/globe/technograd-runnerup.jpg",
    "public/globe/technograd-winners.jpg",
]

HIDE_CSS = (
    "\n  /* events integration: overlays hidden (nodes kept - the scene queries them), globe is the sole focus */\n"
    "  .nav,.band,.hint{display:none!important}\n"
)


def cover_tile(path: Path) -> str:
    from PIL import Image

    im = Image.open(path).convert("RGB")
    s = max(TW / im.width, TH / im.height)
    im = im.resize((round(im.width * s), round(im.height * s)), Image.LANCZOS)
    x, y = (im.width - TW) // 2, (im.height - TH) // 2
    im = im.crop((x, y, x + TW, y + TH))
    buf = io.BytesIO()
    im.save(buf, "WEBP", quality=62, method=6)
    return "data:image/webp;base64," + base64.b64encode(buf.getvalue()).decode()


def main() -> None:
    raw = urllib.request.urlopen(SRC_URL, timeout=60).read().decode()
    files = {f["path"]: f for f in json.loads(raw)["files"]}
    key = "src/shaders/orb-gallery/sources/orb-gallery.html"
    html = files[key].get("code", files[key].get("content", ""))
    digest = hashlib.sha256(html.encode()).hexdigest()
    if not digest.startswith(SRC_SHA):
        sys.exit(f"REFUSED: source sha256 {digest[:16]} != {SRC_SHA}...")
    print("canonical source OK:", digest[:16])

    tiles = [cover_tile(NSDC / p) for p in PHOTOS]
    print(f"tiles: {len(tiles)} photos, avg {sum(map(len, tiles)) // len(tiles) // 1024} KB")
    rng = random.Random(SEED)
    order = list(range(TILES))
    rng.shuffle(order)
    new_array = "const TILE_SRC=[" + ",".join('"%s"' % tiles[order[j] % len(tiles)] for j in range(TILES)) + "];"
    tmap = "\nconst TILE_PHOTO=[" + ",".join(str(order[j] % len(tiles)) for j in range(TILES)) + "];"
    m = re.search(r"const TILE_SRC=\[.*?\];", html, re.S)
    assert m and m.group(0).count("data:image") == TILES
    html = html[: m.start()] + new_array + tmap + html[m.end():]

    # Click (not drag) a card -> tell the parent which photo it shows.
    # Snaps to the nearest plate when the ray lands in a gap, like hover does.
    anchor = "canvas.addEventListener('pointerleave',e=>{ hoverPos=null; end(e); });"
    assert anchor in html
    bridge = anchor + """
  let downX=0,downY=0;
  canvas.addEventListener('pointerdown',e=>{ downX=e.clientX; downY=e.clientY; });
  canvas.addEventListener('click',e=>{
    if(Math.hypot(e.clientX-downX,e.clientY-downY)>6||!CARDS) return;
    const b=canvas.getBoundingClientRect();
    ndc.set(((e.clientX-b.left)/b.width)*2-1,-((e.clientY-b.top)/b.height)*2+1);
    raycaster.setFromCamera(ndc,camera);
    hoverBall.center.copy(orbGroup.position);
    if(!raycaster.ray.intersectsSphere(hoverBall)) return;
    let pick=-1;
    const hit=raycaster.intersectObject(cardMesh,false)[0];
    if(hit&&hit.faceIndex!==undefined) pick=Math.floor(hit.faceIndex/PER);
    else if(raycaster.ray.intersectSphere(hoverBall,hitPt)){
      orbGroup.worldToLocal(hitPt).normalize();
      let best=-1,bd=-2;
      for(let i=0;i<CARDS.length;i++){
        const n=CARDS[i].basis.n, d=n[0]*hitPt.x+n[1]*hitPt.y+n[2]*hitPt.z;
        if(d>bd){bd=d;best=i}
      }
      pick=best;
    }
    if(pick>=0&&CARDS[pick]) parent.postMessage({type:'events-globe:select',photo:TILE_PHOTO[CARDS[pick].tile|0]},'*');
  });"""
    html = html.replace(anchor, bridge, 1)

    assert html.count("#1f1f21") == 2  # css var + atlas letterbox
    html = html.replace("#1f1f21", "#08070D")
    assert html.count("</style>") == 1
    html = html.replace("</style>", HIDE_CSS + "</style>", 1)

    # The animated cloud field lives INSIDE this document, behind the globe
    # canvas (a sibling layer composites reliably; a transparent document root
    # does not). The globe canvas already renders with a transparent clear.
    html = html.replace(
        "</style>",
        "\n  /* events integration: cloud background sits behind the stage */\n"
        "  .stage{z-index:1}\n"
        '  .globe-clouds{position:fixed;inset:0;width:100%;height:100%;border:0;z-index:0;pointer-events:none}\n'
        + "</style>",
        1,
    )
    mbody = re.search(r"<body[^>]*>", html)
    assert mbody
    html = (
        html[: mbody.end()]
        + '\n<iframe class="globe-clouds" src="/cloud-bg.html" title="" aria-hidden="true" tabindex="-1" sandbox="allow-scripts" loading="eager"></iframe>'
        + html[mbody.end():]
    )

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(html)
    print("wrote", OUT.relative_to(NSDC), len(html) // 1024, "KB")


if __name__ == "__main__":
    main()
