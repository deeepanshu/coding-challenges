import { toTimeString } from "../utils";

const MAX_REQUESTS = 60;

class FixedWindowCounter {

    counter: number;
    constructor() {
        this.counter = 0;
    }

    increment() {
        this.counter++;
    }
}


export class FixedWindowCounterRateLimiter {

    // TODO: try to implement `timeWindow` as a number or date
    timeWindow: string;
    ipBasedTimeWindowCounter: Map<string, FixedWindowCounter>;

    constructor() {
        this.timeWindow = toTimeString(new Date());
        this.ipBasedTimeWindowCounter = new Map();
    }

    addUser(ip: string) {
        this.ipBasedTimeWindowCounter.set(ip, new FixedWindowCounter());
    }

    checkRateLimit(ip: string) {
        const requestTime = toTimeString(new Date());
        const timeWindowCounter = this.ipBasedTimeWindowCounter.get(ip);
        if (!timeWindowCounter) {
            this.addUser(ip);
        }

        if (this.timeWindow != requestTime) {
            this.timeWindow = requestTime;
            this.addUser(ip);
        }

        if (timeWindowCounter) {
            timeWindowCounter.increment();
            if (timeWindowCounter.counter > MAX_REQUESTS) {
                throw new Error("Rate limit exceeded");
            }
        }
    }

    cleanUp() {
    }
}