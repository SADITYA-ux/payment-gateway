import type { Request , Response , NextFunction } from "express";

export function requireApiKey(req : Request , res : Response , next : NextFunction)
{
    const apiKey = req.headers["x-api-key"];
    const validKeys = (process.env.VALID_KEY ?? "");

    if(!apiKey || typeof apiKey !== "string" || !validKeys.includes(apiKey))
    {
        return res
            .status(401)
            .json({ message : "Invalid or missing the key"})
    }

    next();
}