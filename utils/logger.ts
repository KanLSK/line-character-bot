export const logger = {
    info: (message: string, meta?: unknown) => {
      // eslint-disable-next-line no-console
      console.info(message, meta);
    },
    error: (message: string, meta?: unknown) => {
      // eslint-disable-next-line no-console
      console.error(message, meta);
    },
    warn: (message: string, meta?: unknown) => {
      // eslint-disable-next-line no-console
      console.warn(message, meta);
    },
    debug: (message: string, data?: any) => {
      if (process.env.NODE_ENV === 'development') {
        console.debug(`[DEBUG] ${new Date().toISOString()}: ${message}`, data || '');
      }
    }
};