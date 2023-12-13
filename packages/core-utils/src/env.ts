

export const __DEV__ = process.env.NODE_ENV !== 'production';

export const isClient =  typeof window !== 'undefined';

export const isServer = !isClient;