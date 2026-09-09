// Project-drawn interface symbols: one 24px grid, rounded 1.8px strokes, no emoji.
export const iconPaths: Record<string,string> = {
  "attack": "<path d=\"m5 19 3-3m-1-3 4 4m-1-5 9-9v6l-7 7M5 19l-2 2\"/>",
  "guard": "<path d=\"m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6Z\"/><path d=\"M12 7v10m-4-5h8\"/>",
  "heal": "<path d=\"M9 3h6v6h6v6h-6v6H9v-6H3V9h6Z\"/>",
  "draw": "<rect x=\"8\" y=\"6\" width=\"12\" height=\"15\" rx=\"2\"/><path d=\"M5 17H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10m-3 9h6m-3-3v6\"/>",
  "energy": "<path d=\"m14 2-9 12h6l-1 8 9-12h-6Z\"/>",
  "bond": "<path d=\"M12 20 4 12C-2 5 8-1 12 7c4-8 14-2 8 5Z\"/><path d=\"m8 12 3 3 5-5\"/>",
  "burden": "<path d=\"m12 3 10 18H2Z\"/><path d=\"M12 9v5m0 3v.1\"/>",
  "corruption": "<path d=\"m12 2 3 4 5 1v5l2 4-5 3-5 3-4-4-5-1v-5L2 7l6-1Z\"/><path d=\"m9 8 3 4-2 3 5 2m-1-9-2 4\"/>",
  "support": "<circle cx=\"12\" cy=\"12\" r=\"8\"/><path d=\"m12 5 2 5 5 2-5 2-2 5-2-5-5-2 5-2Z\"/>",
  "event": "<path d=\"M4 4h16v12H9l-5 5Z\"/><path d=\"M8 8h8M8 12h5\"/>",
  "rest": "<path d=\"m12 3 9 17H3Z\"/><path d=\"m12 10 5 10H7Z\"/>",
  "boss": "<path d=\"m3 5 5 4 4-6 4 6 5-4-3 15H6Z\"/><path d=\"M8 16h8m-6-4h4\"/>",
  "evolution": "<circle cx=\"12\" cy=\"12\" r=\"9\" stroke-dasharray=\"3 2\"/><path d=\"m12 5 5 7-5 7-5-7Z\"/><path d=\"M12 8v8\"/>",
  "check": "<path d=\"m5 12 4 4L19 6\"/>",
  "target": "<circle cx=\"12\" cy=\"12\" r=\"6\"/><path d=\"M12 2v6m0 8v6M2 12h6m8 0h6\"/>",
  "close": "<path d=\"m6 6 12 12M6 18 18 6\"/>",
  "signal": "<path d=\"M4 19v-4m5 4v-8m5 8V7m5 12V3\"/>",
  "data": "<path d=\"m12 2 9 5v10l-9 5-9-5V7Z\"/><circle cx=\"12\" cy=\"12\" r=\"4\"/><path d=\"M12 2v6m0 8v6M3 7l6 3m6 4 6 3M3 17l6-3m6-4 6-3\"/>"
};
const aliases: Record<string,string> = {battle:'attack',elite:'boss',defend:'guard',corrupt:'corruption',drain:'heal'};
export function icon(type:string) {
 const key=aliases[type]||type;
 return `<svg class="icon icon-${key}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${iconPaths[key]||iconPaths.data}</svg>`;
}
