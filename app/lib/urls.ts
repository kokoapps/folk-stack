export function getSearchParams(request: Request) {
  return Object.fromEntries(new URL(request.url).searchParams);
}
