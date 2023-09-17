import { NextFunction, Request, Response } from "express";
import { TokenBucketRateLimiter } from "../ratelimiters/tokenBucketRateLimiter";

const tokenBucketRateLimiter = new TokenBucketRateLimiter()

export const useRateLimiter = (request: Request, response: Response, next: NextFunction) => {
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

export const clearIntervals = tokenBucketRateLimiter.clearIntervals
