declare let navigation: {
    [key: string]: any;
    back: (url: string, onSuccess?: () => any) => void;
    replaceURL: (url: string, onSuccess?: () => any, state?: any) => void;
    replaceQuery: (query: Record<PropertyKey, string | undefined>, onSuccess?: () => any) => void;
    forward: (url: string, onSuccess?: () => any) => void;
};

export { navigation };
