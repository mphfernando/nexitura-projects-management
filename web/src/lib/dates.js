const S0 = Date.UTC(1899, 11, 30);

export const d = s => new Date(S0 + s * 86400000);
export const todaySerial = () => Math.floor((Date.now() - S0) / 86400000);
export const fdate = s => d(s).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' });
export const fdateY = s => d(s).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
export const serialToISO = s => d(s).toISOString().slice(0, 10);
export const isoToSerial = iso => Math.round((Date.UTC(+iso.slice(0, 4), +iso.slice(5, 7) - 1, +iso.slice(8, 10)) - S0) / 86400000);

export const WEEK1_START = 46195, NUM_WEEKS = 23;
export function buildDefaultWeeks() {
  const arr = [];
  for (let i = 0; i < NUM_WEEKS; i++) {
    const s = WEEK1_START + i * 7, e = s + 6;
    arr.push({ id: "wk" + (i + 1), label: "Week " + (i + 1), start: s, end: e });
  }
  return arr;
}
export function currentWeekId(weeks) {
  const t = todaySerial();
  const w = weeks.find(w => t >= w.start && t <= w.end);
  return w ? w.id : (t < weeks[0].start ? weeks[0].id : weeks[weeks.length - 1].id);
}
export function weekRange(w) { return fdate(w.start) + " – " + fdate(w.end); }
