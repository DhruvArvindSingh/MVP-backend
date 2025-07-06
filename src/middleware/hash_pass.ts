
import hash from '../utils/hash.js';
import { Request, Response, NextFunction } from "express";


export default async function hash_pass(req: Request, res: Response, next: NextFunction) {
    console.log("hash_pass called");
    console.log("req.body =", req.body);
    req.body.password = await hash(req.body.password);
    next();
}