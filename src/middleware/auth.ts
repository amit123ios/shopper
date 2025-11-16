import {Request, Response, NextFunction } from "express";
import jwt, {JwtPayload} from "jsonwebtoken";
import { AuthRequest } from "../controllers/AuthController";

// Custom JWT payload type
interface MyJwtPayload extends JwtPayload {
  id: number;
  email?: string;
}
function authenticateToken(req: AuthRequest, res : Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

  if (!token) return res.status(401).json({ message: "Access denied. No token provided." });
  try{
   // Verify token and assert type
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as MyJwtPayload;

    // Attach user info to request
    req.user = { id: payload.id, email: payload.email };

    next(); // continue to the route handler
  }catch(err: any){
    return res.status(403).json({message: "Invalid or expired token"});
  }
}

export default authenticateToken;
