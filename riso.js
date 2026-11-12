// Original generative print illustrations. Only immutable catalog fields seed
// the composition, so a piece keeps its artwork across filters and visits.
const PALETTES = [
  ['#ffe7f0', '#087fc5', '#ed428e', '#173f61'],
  ['#fff0d1', '#ff9660', '#12634c', '#143f39'],
  ['#fff2a7', '#a28be1', '#ef687b', '#564883'],
  ['#f5eddc', '#ff7553', '#236b85', '#253c4f'],
  ['#e8e3fa', '#ff7a6d', '#6456b7', '#42376f'],
  ['#f8edc9', '#e6a637', '#eb597a', '#62613c'],
  ['#f6d7e5', '#3e83b7', '#ed6950', '#244d63'],
  ['#f0edda', '#b5a2e5', '#25775c', '#405646'],
  ['#ffebda', '#e94d7a', '#eca13b', '#773963']
];

const MOTIFS = {
  calm: 'tide', rest: 'rest', grief: 'moon', joy: 'sun',
  connection: 'connection', confidence: 'mountain', motivation: 'growing',
  clarity: 'window', focus: 'window', creativity: 'stilllife',
  acceptance: 'tide', boundaries: 'garden', awe: 'orbit',
  catharsis: 'release', play: 'sun', hope: 'growing',
  selfcompassion: 'garden', change: 'mountain'
};

function hash(value, initial = 2166136261) {
  let h = initial >>> 0;
  for (let i = 0; i < value.length; i++) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function key(item) {
  return JSON.stringify([String(item.id || item.title || 'resonance'), String(item.kind || ''), item.themes || []]);
}

export function artFingerprint(item) {
  const identity = key(item);
  return `riso-${hash(identity).toString(36)}-${hash(identity, 2246822519).toString(36)}`;
}

function generator(seed) {
  let state = seed;
  return (min = 0, max = 1) => {
    state += 0x6d2b79f5;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return min + (((t ^ (t >>> 14)) >>> 0) / 4294967296) * (max - min);
  };
}

const num = v => Number(v.toFixed(2));
const point = (x, y) => `${num(x)},${num(y)}`;
const circle = (x, y, r, fill, extra = '') => `<circle cx="${num(x)}" cy="${num(y)}" r="${num(r)}" fill="${fill}" ${extra}/>`;
const ellipse = (x, y, rx, ry, fill, extra = '') => `<ellipse cx="${num(x)}" cy="${num(y)}" rx="${num(rx)}" ry="${num(ry)}" fill="${fill}" ${extra}/>`;
const rect = (x, y, w, h, fill, r = 0, extra = '') => `<rect x="${num(x)}" y="${num(y)}" width="${num(w)}" height="${num(h)}" rx="${r}" fill="${fill}" ${extra}/>`;
const path = (d, fill, extra = '') => `<path d="${d}" fill="${fill}" ${extra}/>`;
const line = (x, y, xx, yy, stroke, width = 3, extra = '') => `<path d="M${point(x, y)}L${point(xx, yy)}" fill="none" stroke="${stroke}" stroke-width="${width}" stroke-linecap="round" ${extra}/>`;
const blend = 'style="mix-blend-mode:multiply"';

function star(x, y, size, ink, rotation = 0) {
  return path(`M${point(x, y - size)}Q${point(x + size * .17, y - size * .17)} ${point(x + size, y)}Q${point(x + size * .17, y + size * .17)} ${point(x, y + size)}Q${point(x - size * .17, y + size * .17)} ${point(x - size, y)}Q${point(x - size * .17, y - size * .17)} ${point(x, y - size)}Z`, ink, `transform="rotate(${rotation} ${x} ${y})"`);
}

function leaf(x, y, size, angle, ink) {
  return path(`M0 0C${point(-size * .55, -size * .7)} ${point(-size * .48, -size)} 0 ${-num(size)}C${point(size * .65, -size * .7)} ${point(size * .45, -size * .15)} 0 0Z`, ink, `transform="translate(${point(x, y)}) rotate(${num(angle)})" ${blend}`);
}

function tide(c) {
  const {rand, paper, a, b, deep, dots} = c;
  const sx = rand(140, 455), sy = rand(90, 146), radius = rand(48, 77);
  let art = circle(sx + 5, sy - 2, radius, a, 'opacity=".25"');
  art += circle(sx, sy, radius, b) + circle(sx, sy, radius, dots, 'opacity=".45"');
  for (let i = 0; i < 3; i++) {
    const y = 192 + i * 54, bend = rand(25, 66);
    art += path(`M-10 ${y}C145 ${num(y - bend)} 208 ${num(y + bend)} 340 ${y}S505 ${num(y - bend)} 610 ${num(y + 7)}V410H-10Z`, [a, b, deep][i], `opacity="${[.82, .68, .8][i]}" ${blend}`);
  }
  for (let i = 0; i < 7; i++) {
    const y = 222 + i * 18;
    art += path(`M35 ${y}C150 ${y - 37} 240 ${y + 38} 365 ${y - 6}S520 ${y - 20} 575 ${y}`, 'none', `stroke="${paper}" stroke-width="2.5" opacity=".62"`);
  }
  return art + star(rand(70, 110), rand(80, 130), 15, deep);
}

function sun(c) {
  const {rand, a, b, deep, paper, dots} = c;
  const x = rand(235, 350), y = rand(149, 188), r = rand(72, 96), count = Math.floor(rand(11, 17));
  let art = '';
  for (let i = 0; i < count; i++) {
    const angle = i * 360 / count + rand(-4, 4);
    art += rect(x - 9, y - r - rand(42, 69), 18, rand(31, 48), i % 3 ? a : b, 9, `transform="rotate(${num(angle)} ${num(x)} ${num(y)})"`);
  }
  art += circle(x + 4, y + 3, r, deep, 'opacity=".2"') + circle(x, y, r, b);
  art += circle(x - r * .2, y + r * .14, r * .72, dots, 'opacity=".65"');
  art += path(`M-20 345Q122 251 263 340T620 302V410H-20Z`, a, `opacity=".84" ${blend}`);
  art += ellipse(420, 332, 73, 30, b, `transform="rotate(-18 420 332)" ${blend}`);
  art += rect(80, 269, 95, 48, deep, 23, 'transform="rotate(-28 127 293)"');
  for (let i = 0; i < 5; i++) art += circle(rand(54, 553), rand(55, 318), rand(4, 8), i % 2 ? b : deep);
  return art + star(486, 112, rand(19, 28), deep, -16) + star(104, 92, 12, paper);
}

function growing(c) {
  const {rand, a, b, deep, paper, dots} = c;
  const x = rand(268, 331), top = rand(58, 90), ground = 310;
  let art = circle(rand(115, 171), rand(90, 150), rand(38, 59), b, 'opacity=".85"');
  art += ellipse(x, 344, 171, 22, deep, 'opacity=".16"');
  art += path(`M${point(x - 73, 251)}H${num(x + 75)}L${num(x + 50)} 344Q${num(x)} 361 ${num(x - 52)} 344Z`, b);
  art += path(`M${point(x - 71, 251)}H${num(x + 75)}L${num(x + 51)} 344Q${num(x + 12)} 356 ${num(x - 8)} 351Z`, dots, 'opacity=".63"');
  art += path(`M${point(x, ground)}C${point(x + 13, 224)} ${point(x - 17, 143)} ${point(x, top)}`, 'none', `stroke="${deep}" stroke-width="7" stroke-linecap="round"`);
  for (let i = 0; i < 6; i++) {
    const y = 104 + i * 26, side = i % 2 ? 1 : -1, size = rand(57, 93);
    art += leaf(x + side * 2, y + 29, size, side * rand(43, 72), i % 3 ? a : deep);
    art += line(x + side * 5, y + 24, x + side * size * .49, y - size * .12, paper, 1.8, 'opacity=".65"');
  }
  art += leaf(x, top + 22, 50, rand(-13, 14), a);
  return art + star(461, 123, 22, b) + circle(457, 224, 5, deep);
}

function connection(c) {
  const {rand, a, b, deep, paper, dots} = c;
  const angle = rand(-27, 27), x = rand(280, 320), y = rand(189, 214);
  let art = circle(110, 90, rand(24, 37), b, 'opacity=".8"') + ellipse(306, 338, 182, 16, deep, 'opacity=".15"');
  art += `<g transform="translate(${point(x, y)}) rotate(${num(angle)})">`;
  art += ellipse(-73, 4, 100, 115, 'none', `stroke="${deep}" stroke-width="41" opacity=".17"`);
  art += ellipse(-78, 0, 100, 115, 'none', `stroke="${a}" stroke-width="43"`);
  art += ellipse(79, 0, 100, 115, 'none', `stroke="${b}" stroke-width="44" ${blend}`);
  art += ellipse(79, 0, 100, 115, 'none', `stroke="${dots}" stroke-width="44" opacity=".55"`);
  // One overpass turns the overlapping rings into a woven connection.
  art += path('M-2 -74C15 -43 20 -18 20 12', 'none', `stroke="${a}" stroke-width="43"`);
  art += path('M-9 -78C9 -44 14 -19 14 10', 'none', `stroke="${paper}" stroke-width="2" opacity=".45"`);
  art += '</g>' + star(492, 84, 26, deep, 12) + star(102, 295, 15, b, -12);
  return art;
}

function moon(c) {
  const {rand, a, b, deep, paper, dots} = c;
  const x = rand(270, 364), y = rand(126, 165), r = rand(72, 94);
  let art = rect(56, 35, 488, 327, a, 145, 'opacity=".16"');
  art += circle(x + 4, y - 2, r, deep, 'opacity=".2"');
  art += path(`M${point(x + r * .48, y - r * .88)}A${r} ${r} 0 1 0 ${point(x + r * .48, y + r * .88)}A${num(r * .81)} ${num(r * .92)} 0 0 1 ${point(x + r * .48, y - r * .88)}Z`, b);
  art += path(`M0 331Q91 263 202 326T398 315T600 323V400H0Z`, a, `opacity=".8" ${blend}`);
  art += path('M0 375Q114 296 245 363T600 344V400H0Z', deep, 'opacity=".72"');
  for (let i = 0; i < 19; i++) {
    const rx = rand(86, 520), ry = rand(83, 319);
    if (Math.hypot(rx - x, ry - y) < r + 18) continue;
    art += line(rx, ry, rx - 7, ry + rand(12, 22), i % 3 ? a : deep, 2.5, 'opacity=".75"');
  }
  art += star(146, 102, 21, deep) + star(447, 80, 14, b);
  art += ellipse(165, 333, 65, 17, dots, 'opacity=".5"');
  return art + line(266, 350, 361, 350, paper, 2, 'opacity=".5"');
}

function stilllife(c) {
  const {rand, a, b, deep, paper, dots, stripes} = c;
  const x = rand(264, 316), y = rand(185, 220), tilt = rand(-9, 9);
  let art = rect(46, 287, 510, 71, deep, 0, 'opacity=".13"');
  art += ellipse(307, 337, 194, 18, deep, 'opacity=".19"');
  art += `<g transform="rotate(${num(tilt)} ${num(x)} 291)">`;
  art += ellipse(x + 75, y + 50, 48, 48, 'none', `stroke="${b}" stroke-width="20"`);
  art += path(`M${point(x - 52, y - 17)}H${num(x + 54)}V${num(y + 10)}C${num(x + 88)} ${num(y + 56)} ${num(x + 84)} 326 ${num(x)} 335C${num(x - 84)} 326 ${num(x - 87)} ${num(y + 59)} ${num(x - 51)} ${num(y + 10)}Z`, b);
  art += path(`M${point(x, y - 17)}H${num(x + 54)}V${num(y + 10)}C${num(x + 88)} ${num(y + 56)} ${num(x + 84)} 326 ${num(x)} 335Z`, dots, 'opacity=".65"');
  art += ellipse(x + 1, y - 17, 54, 11, deep);
  art += line(x, y - 15, x + 21, 79, deep, 5);
  art += leaf(x + 11, 150, 68, -53, a) + leaf(x + 15, 132, 64, 48, a);
  art += circle(x + 21, 70, 31, a) + star(x + 21, 70, 28, b, 30) + circle(x + 21, 70, 11, deep);
  art += '</g>';
  art += rect(93, 284, 111, 44, a, 0, 'transform="rotate(-7 148 306)"');
  art += rect(93, 290, 111, 32, stripes, 0, 'transform="rotate(-7 148 306)" opacity=".5"');
  art += circle(433, 296, rand(36, 47), a, blend) + ellipse(437, 294, 20, 43, dots, 'opacity=".55"');
  return art + star(466, 111, 26, deep) + circle(120, 165, 8, b) + line(95, 343, 501, 343, paper, 2);
}

function windowPrint(c) {
  const {rand, a, b, deep, paper, dots, stripes} = c;
  const x = rand(157, 194), w = rand(214, 266), y = 51, h = 280;
  let art = rect(x + 15, y + 11, w, h, deep, 0, 'opacity=".17"');
  art += rect(x, y, w, h, a) + rect(x + 17, y + 17, w - 34, h - 34, paper);
  art += circle(x + w * .63, 133, rand(34, 46), b);
  art += path(`M${num(x + 17)} 250L${point(x + 87, 173)}L${point(x + 160, 249)}L${point(x + w - 17, 213)}V314H${num(x + 17)}Z`, b, 'opacity=".82"');
  art += path(`M${num(x + 17)} 285Q${num(x + 130)} 207 ${num(x + w - 17)} 271V314H${num(x + 17)}Z`, deep, 'opacity=".8"');
  art += path(`M${num(x + w * .54)} 251Q${num(x + 44)} 277 ${num(x + w * .49)} 314H${num(x + w * .7)}Q${num(x + w * .28)} 282 ${num(x + w * .56)} 251Z`, paper);
  art += rect(x, 178, w, 12, a) + rect(x + w * .47, y, 12, h, a);
  art += rect(x - 21, 330, w + 42, 15, deep) + rect(x - 21, 330, w + 42, 15, dots, 0, 'opacity=".65"');
  art += rect(61, 75, 44, 235, b, 22, 'opacity=".55"');
  art += rect(61, 75, 44, 235, stripes, 22, 'opacity=".6"');
  return art + star(502, 110, 23, deep) + circle(500, 288, 9, b);
}

function mountain(c) {
  const {rand, a, b, deep, paper, dots} = c;
  const peakX = rand(245, 346), peakY = rand(70, 110);
  let art = circle(rand(125, 200), rand(95, 145), rand(38, 56), b);
  art += path(`M14 341L170 ${num(rand(160, 203))}L340 341Z`, b, 'opacity=".8"');
  art += path(`M117 349L${point(peakX + 6, peakY - 3)}L514 349Z`, deep, 'opacity=".18"');
  art += path(`M110 350L${point(peakX, peakY)}L508 350Z`, a);
  art += path(`M${point(peakX, peakY)}L508 350H${num(peakX - 28)}Z`, deep, `opacity=".5" ${blend}`);
  art += path(`M${point(peakX, peakY)}L${point(peakX + 48, peakY + 63)}L${point(peakX + 15, peakY + 49)}L${point(peakX - 12, peakY + 77)}L${point(peakX - 37, peakY + 60)}Z`, paper);
  art += path(`M${point(peakX + 2, peakY + 109)}L${point(peakX + 72, 278)}L${point(peakX + 27, 302)}L${point(peakX + 80, 350)}H${num(peakX + 56)}L${point(peakX + 5, 300)}L${point(peakX + 52, 277)}Z`, b);
  art += path('M374 350L471 210L587 350Z', b, blend);
  art += path('M374 350L471 210L587 350Z', dots, 'opacity=".5"');
  art += line(39, 352, 565, 352, deep, 3);
  return art + star(487, 91, 22, deep) + star(92, 243, 11, b);
}

function garden(c) {
  const {rand, a, b, deep, paper, dots} = c;
  const x = rand(289, 327), radius = rand(79, 104), base = 337, top = rand(118, 143);
  let art = ellipse(x, 344, 181, 18, deep, 'opacity=".16"');
  art += path(`M${num(x - radius - 26)} ${base}V${top}A${num(radius + 26)} ${num(radius + 26)} 0 0 1 ${num(x + radius + 26)} ${top}V${base}H${num(x + radius - 9)}V${top}A${num(radius - 9)} ${num(radius - 9)} 0 0 0 ${num(x - radius + 9)} ${top}V${base}Z`, b);
  art += path(`M${num(x - radius - 26)} ${base}V${top}A${num(radius + 26)} ${num(radius + 26)} 0 0 1 ${num(x + radius + 26)} ${top}V${base}H${num(x + radius - 9)}V${top}A${num(radius - 9)} ${num(radius - 9)} 0 0 0 ${num(x - radius + 9)} ${top}V${base}Z`, dots, 'opacity=".42"');
  art += circle(x, 173, 38, a, 'opacity=".8"');
  art += path(`M${num(x - radius + 10)} 273Q${x} 210 ${num(x + radius - 10)} 277V337H${num(x - radius + 10)}Z`, a);
  art += path(`M${num(x - 4)} 251Q${num(x + 64)} 282 ${num(x - 3)} 337H${num(x + 36)}Q${num(x + 85)} 274 ${num(x + 2)} 251Z`, paper);
  const stalk = x - radius - 67;
  art += path(`M${num(stalk)} 337Q${num(stalk - 13)} 243 ${num(stalk + 8)} 174`, 'none', `stroke="${deep}" stroke-width="5"`);
  for (let i = 0; i < 5; i++) art += leaf(stalk, 210 + i * 24, rand(41, 60), i % 2 ? 55 : -52, i % 3 ? a : deep);
  return art + star(508, 156, 21, deep) + circle(490, 278, 6, b);
}

function orbit(c) {
  const {rand, a, b, deep, paper, dots} = c;
  const x = rand(283, 321), y = rand(184, 219), r = rand(69, 92), angle = rand(-31, -12);
  let art = circle(x + 6, y + 3, r, deep, 'opacity=".19"') + circle(x, y, r, a);
  art += circle(x - 16, y + 16, r * .77, dots, 'opacity=".6"');
  art += `<g transform="rotate(${num(angle)} ${num(x)} ${num(y)})">`;
  art += ellipse(x, y, 193, 48, 'none', `stroke="${b}" stroke-width="22" ${blend}`);
  art += path(`M${point(x - r + 4, y - 13)}A${r} ${r} 0 0 1 ${point(x + r - 3, y - 13)}Z`, a);
  art += path(`M${point(x - 183, y + 4)}C${point(x - 130, y + 61)} ${point(x + 145, y + 61)} ${point(x + 187, y)}`, 'none', `stroke="${paper}" stroke-width="2.5" opacity=".6"`);
  art += '</g>';
  art += circle(478, 79, rand(16, 27), b) + circle(111, 296, rand(12, 21), deep);
  for (let i = 0; i < 7; i++) {
    const sx = rand(56, 551), sy = rand(48, 345);
    if (Math.hypot(sx - x, sy - y) > 130) art += star(sx, sy, rand(8, 17), i % 2 ? b : deep, i * 17);
  }
  return art;
}

function release(c) {
  const {rand, a, b, deep, paper, dots} = c;
  const x = rand(260, 339), y = rand(175, 204);
  let art = ellipse(x, 341, 167, 17, deep, 'opacity=".14"');
  art += path(`M${point(x - 91, 321)}Q${point(x - 68, 251)} ${point(x - 14, 273)}Q${point(x + 5, 220)} ${point(x + 48, 268)}Q${point(x + 129, 247)} ${point(x + 130, 321)}Z`, a);
  art += path(`M${point(x - 91, 321)}Q${point(x - 68, 251)} ${point(x - 14, 273)}Q${point(x + 5, 220)} ${point(x + 48, 268)}Q${point(x + 129, 247)} ${point(x + 130, 321)}Z`, dots, 'opacity=".6"');
  for (let i = 0; i < 8; i++) {
    const angle = i * 45 + rand(-9, 9), length = rand(49, 93);
    art += leaf(x, y, length, angle, i % 3 === 0 ? deep : b);
  }
  art += circle(x, y, 25, paper) + circle(x + 2, y - 2, 13, a);
  art += path('M102 188Q70 126 133 90M477 198Q527 165 487 105', 'none', `stroke="${a}" stroke-width="6" stroke-linecap="round"`);
  art += star(111, 87, 19, b, -15) + star(493, 91, 22, deep, 19);
  return art + circle(162, 261, 8, b) + circle(426, 60, 6, a);
}

function rest(c) {
  const {rand, a, b, deep, paper, dots, stripes} = c;
  const x = rand(255, 317), y = rand(218, 244), angle = rand(-12, 9);
  let art = circle(rand(397, 451), rand(91, 118), rand(40, 57), b, 'opacity=".88"');
  art += rect(70, 313, 460, 31, deep, 15, 'opacity=".17"');
  art += `<g transform="rotate(${num(angle)} ${num(x)} ${num(y)})">`;
  art += path(`M${point(x - 141, y - 61)}Q${point(x, y - 107)} ${point(x + 150, y - 53)}Q${point(x + 132, y)} ${point(x + 154, y + 61)}Q${point(x, y + 98)} ${point(x - 144, y + 54)}Q${point(x - 126, y)} ${point(x - 141, y - 61)}Z`, a);
  art += path(`M${point(x - 141, y - 61)}Q${point(x, y - 107)} ${point(x + 150, y - 53)}Q${point(x + 132, y)} ${point(x + 154, y + 61)}Q${point(x, y + 98)} ${point(x - 144, y + 54)}Q${point(x - 126, y)} ${point(x - 141, y - 61)}Z`, dots, 'opacity=".5"');
  art += ellipse(x, y - 1, 90, 47, b, `transform="rotate(-10 ${num(x)} ${num(y)})" ${blend}`);
  art += path(`M${point(x - 105, y - 34)}Q${point(x, y - 68)} ${point(x + 109, y - 33)}M${point(x - 105, y + 37)}Q${point(x, y + 65)} ${point(x + 111, y + 39)}`, 'none', `stroke="${paper}" stroke-width="2.5" opacity=".7"`);
  art += '</g>';
  art += leaf(129, 170, 84, -40, b) + leaf(130, 170, 63, 19, deep);
  art += rect(455, 236, 47, 71, b, 6) + rect(455, 236, 47, 71, stripes, 6, 'opacity=".45"');
  return art + star(235, 83, 20, deep) + star(336, 58, 10, a);
}

const SCENES = {tide, sun, growing, connection, moon, stilllife, window: windowPrint, mountain, garden, orbit, release, rest};

export function renderRisograph(item) {
  const identity = key(item), seed = hash(identity), rand = generator(seed);
  const id = artFingerprint(item);
  const themes = (item.themes || []).filter(theme => MOTIFS[theme]);
  // Prefer the first three editorial themes, with variation for rich catalogs.
  const theme = themes[Math.floor(rand(0, Math.min(3, themes.length)))] || 'creativity';
  const motif = MOTIFS[theme];
  const [paper, a, b, deep] = PALETTES[Math.floor(rand(0, PALETTES.length))];
  const dots = `url(#${id}-dots)`, stripes = `url(#${id}-lines)`;
  const context = {rand, paper, a, b, deep, dots, stripes};
  const composition = SCENES[motif](context);
  let flecks = '';
  for (let i = 0; i < 51; i++) {
    flecks += circle(rand(20, 580), rand(18, 382), rand(.45, 1.35), i % 3 ? deep : paper, `opacity="${num(rand(.1, .3))}"`);
  }
  const plateX = num(rand(-2, 2)), plateY = num(rand(-1.5, 1.5));
  return `<svg class="risograph-print" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" aria-hidden="true" focusable="false" data-art="${id}" data-motif="${motif}" style="isolation:isolate">
    <defs>
      <pattern id="${id}-dots" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(${Math.floor(rand(-20, 20))})"><circle cx="1.7" cy="1.7" r="1.1" fill="${deep}"/></pattern>
      <pattern id="${id}-lines" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(-28)"><path d="M0 0V6" stroke="${deep}" stroke-width="1.2"/></pattern>
      <filter id="${id}-grain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".72" numOctaves="2" stitchTiles="stitch" seed="${seed % 997}"/><feColorMatrix type="saturate" values="0"/></filter>
      <clipPath id="${id}-edge"><rect x="0" y="0" width="600" height="400"/></clipPath>
    </defs>
    <g clip-path="url(#${id}-edge)">
      ${rect(0, 0, 600, 400, paper)}
      <g transform="translate(${plateX} ${plateY})">${composition}</g>
      <g>${flecks}</g>
      <rect width="600" height="400" filter="url(#${id}-grain)" opacity=".14" style="mix-blend-mode:multiply"/>
      <path d="M19 34V20H34M566 20H580V34M19 366V380H34M566 380H580V366" fill="none" stroke="${deep}" stroke-width=".75" opacity=".22"/>
    </g>
  </svg>`;
}
