export function fmtUSD(x: number): string {
  return `$${x.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}

export function fmtNum(x: number): string {
  return x.toLocaleString(undefined, { maximumFractionDigits: 8 });
}
