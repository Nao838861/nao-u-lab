// Which recorded field each scene shows. Clips: color / mono / gsu_color / fourbpp / sa1 (see tools/record_all.sh).
// color, mono, gsu_color and fourbpp share the same pad input, so the same field shows the same moment.
export const CLIP = {
  opening: 1200,
  roads: 2400,
  gridScene: 1500, // gsu_color window with the palette grid (must lie inside palgrid.json range)
  slow: 2000,
  colorBoss: 3800,
  monoSplit: 2600,
  fourbpp: 2400,
  fourbppBoss: 2000,
  sa1: 3800,
  ending: 3200,
};
