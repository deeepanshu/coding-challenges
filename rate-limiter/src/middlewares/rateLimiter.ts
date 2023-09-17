import { NextFunction, Request, Response } from "express";
import { TokenBucketRateLimiter } from "../ratelimiters/tokenBucketRateLimiter";
import { FixedWindowCounterRateLimiter } from "../ratelimiters/fixedWindowCounterRateLimiter";

const tokenBucketRateLimiter = new TokenBucketRateLimiter();
const fixedWindowCounterRateLimiter = new FixedWindowCounterRateLimiter();

export const useTokenBucketRateLimiter = (request: Request, response: Response, next: NextFunction) => {
    const ip = request.socket.remoteAddress;
    if (!ip) {
        return response.status(400).send("No ip found in request");
    }
    try {
        const token = tokenBucketRateLimiter.checkRateLimit(ip);
        request.headers['x-rate-limit-token'] = token;
        next();
    } catch (error: any) {
        return response.status(429).send(error.message);
    }
};

export const useFixedWindowCounterRateLimiter = (request: Request, response: Response, next: NextFunction) => {
    const ip = request.socket.remoteAddress;
    if (!ip) {
        return response.status(400).send("No ip found in request");
    }
    try {
        fixedWindowCounterRateLimiter.checkRateLimit(ip);
        next();
    } catch (error: any) {
        return response.status(429).send(error.message);
    }
}

export const cleanUp = tokenBucketRateLimiter.cleanUp;
