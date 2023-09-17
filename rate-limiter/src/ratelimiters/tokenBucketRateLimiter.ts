import cuid from 'cuid';
import { RateLimiter } from '../types';

const MAX_TOKENS = 10;

class TokenBucket {
    bucket: string[] = [];

    constructor() {
        this.bucket = Array(MAX_TOKENS).fill(0).map(cuid);
    }

    getToken(): string | undefined {
        return this.bucket.pop();
    }

    refillTokens() {
        if (this.bucket.length < MAX_TOKENS) {
            this.bucket.push(cuid());
        }
    }

    isEmpty() {
        return this.bucket.length === 0;
    }
}

export class TokenBucketRateLimiter implements RateLimiter {
    buckets: Map<string, TokenBucket>;
    intervals: Map<string, NodeJS.Timeout>;

    constructor() {
        this.buckets = new Map();
        this.intervals = new Map();
    }

    addUser(ip: string) {
        if (!this.buckets.has(ip)) {
            const bucket = new TokenBucket();
            this.buckets.set(ip, bucket);
            this.intervals.set(ip, setInterval(() => bucket.refillTokens(), 1000));
        }
    }

    getToken(ip: string): string | undefined {
        const bucket = this.buckets.get(ip);
        if (!bucket) {
            throw new Error("No bucket found for ip - " + ip);
        }
        return bucket.getToken();
    }

    checkRateLimit(ip: string): string | undefined {
        const bucket = this.buckets.get(ip);
        if (!bucket) {
            this.addUser(ip);
        }

        if (bucket && bucket.isEmpty()) {
            throw new Error("Rate Limit Exceeded");
        }

        return this.getToken(ip);
    }

    clearIntervals() {
        this.intervals.forEach(interval => clearInterval(interval));
    }
}
