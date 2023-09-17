import express, { Request, Response } from 'express';
import { useRateLimiter, cleanUp } from './src/middlewares/rateLimiter';
const app = express();

process.exit = () => {
    cleanUp();
    process.exit();
}

app.get('/limited', useRateLimiter, (request: Request, response: Response) => response.send("I am limited, don't over use me!"))
app.get('/unlimited', (request: Request, response: Response) => response.send("I'm unlimited!"))

app.listen(process.env.PORT || 3000, () => console.log('Server is running'));