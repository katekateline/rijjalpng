# Audio Credits

SORT//VOID does not ship any recorded audio, sound effects, or music.

All sound is generated at runtime in the browser with the Web Audio API:
oscillators, gain envelopes, a biquad low-pass filter and a shared dynamics
compressor. There are no downloaded samples, no remote assets and no
third-party audio libraries.

| Source | Type | License | Attribution |
| --- | --- | --- | --- |
| None (procedural synthesis) | Oscillator / envelope synthesis | Not applicable | Not required |

## Why no sourced assets

A small, royalty-free sample pack was considered (Freesound, Pixabay, Mixkit,
OpenGameArt are the usual CC0 sources), but every requested cue — comparisons,
swaps, pivots, search visits, generation ticks, completion phrases, fractal and
Fourier ambience — maps directly onto pitch, duration and timbre parameters.
Procedural synthesis keeps the bundle at zero bytes, avoids licensing and
attribution obligations, and lets the sound follow the actual algorithm events
rather than a fixed loop.

If recorded textures are added later, document them in the table above with the
source URL, author, license and attribution requirement, and confirm the license
permits the intended use before committing the file.
