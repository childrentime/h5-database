export function appendQuery(params: Record<PropertyKey, string | undefined>, href: string) {
  const url = new URL(href);

  for (const key in params) {
    const value = params[key];
    if (value === undefined) {
      url.searchParams.delete(key);
    } else {
      url.searchParams.set(key, value);
    }
  }

  return url.toString();
}


export interface QueryParams {
  [key: string]: string | string[];
}

export function parseQuery(queryString: string): QueryParams {
  const searchParams = new URLSearchParams(queryString);
  const params: QueryParams = {};

  for (const [key, value] of searchParams) {
    if (params.hasOwnProperty(key)) {
      if (Array.isArray(params[key])) {
        /**@ts-ignore */
        params[key].push(value);
      } else {
        /**@ts-ignore */
        params[key] = [params[key], value];
      }
    } else {
      params[key] = value;
    }
  }

  return params;
}

export function parseUrlQuery(url: string) {
  const query = url.split("?")?.[1] || "";
  return parseQuery(query);
}
