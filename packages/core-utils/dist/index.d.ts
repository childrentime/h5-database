declare function appendQuery(params: Record<PropertyKey, string | undefined>, href: string): string;
interface QueryParams {
    [key: string]: string | string[];
}
declare function parseQuery(queryString: string): QueryParams;
declare function parseUrlQuery(url: string): QueryParams;

declare const __DEV__: boolean;
declare const isClient: boolean;
declare const isServer: boolean;

declare function copyStaticProperties(base: any, target: any): void;

export { QueryParams, __DEV__, appendQuery, copyStaticProperties, isClient, isServer, parseQuery, parseUrlQuery };
