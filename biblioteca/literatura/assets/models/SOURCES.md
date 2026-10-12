# Book models

Downloaded from Poly Pizza on 2026-10-12. Creator: Quaternius.
All four original models are Public Domain / CC0 1.0.
https://creativecommons.org/publicdomain/zero/1.0/

| Local file | Original model page | Original GLB |
| --- | --- | --- |
| book-open.glb | https://poly.pizza/m/FsCIGEfTEs | https://static.poly.pizza/8127840e-d767-4dbf-89a8-1aad1fffed13.glb |
| book-open-wide.glb | https://poly.pizza/m/JEDMpG0UIR | https://static.poly.pizza/64810c3b-57be-44be-aaba-926b56a0cebc.glb |
| book-closed.glb | https://poly.pizza/m/Qkvcgg5tpj | https://static.poly.pizza/3b802cb1-60a9-4407-a9d1-fa0da66186f7.glb |
| book-closed-gold.glb | https://poly.pizza/m/LC0w7VI75u | https://static.poly.pizza/22289cc7-5558-4c18-a927-014c5c1c7d63.glb |

The GLB geometry and materials are unmodified. The page changes object position,
scale and rotation at runtime. No source server requests are needed to render them.

GLTFLoader, BufferGeometryUtils and SkeletonUtils are vendored from Three.js
0.186.0 (MIT), matching the site's existing Three.js runtime. Only module import
paths were changed. See ../vendor/THREE-LICENSE.txt.

The runtime loads book-loader.min.js, bundled and minified with esbuild from
GLTFLoader.js and its two utility dependencies. The existing site Three.js module
remains external and is shared with the galaxy scene; no second Three.js copy is
included. Source modules and their MIT license are retained in ../vendor/.
