/** Next.js App Router may pass a single string or repeated keys as string[]. */
export function firstSearchParam(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}
