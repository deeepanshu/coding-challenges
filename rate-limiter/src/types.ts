export interface RateLimiter {
    checkRateLimit: (ip: string) => string | undefined;
    cleanUp: () => void;
}