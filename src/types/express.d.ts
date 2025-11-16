import { JwtPayload } from "jsonwebtoken";

declare module "express-serve-static-core" {
    interface Request {
        //user?: { id: number; email?: string } & JwtPayload;
        user?: JwtPayload & { id: number; email?: string };
    }
}

export {}; // makes it a module
