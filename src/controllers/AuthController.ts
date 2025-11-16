//controllers/authcontroller.js
import { Request, Response } from "express";
import pool from "../config/database";
import { PoolClient } from "pg";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import validator from "validator";
import { generateRefreshToken } from "../utils/tokenUtils";
import runTransaction from "../utils/dbTransaction";


// Extend Express Request type to include `user`
export interface AuthRequest extends Request {
  user?: { id: number; email?: string };
}

// Load expiry days from .env
const REFRESH_TOKEN_EXPIRY = parseInt(process.env.REFRESH_TOKEN_EXPIRY_DAYS ?? "7", 10);

const JWT_SECRET: string = process.env.JWT_SECRET ?? "";
//Login User 
export const loginUser = async (req: Request, res: Response)  => {
    const { email, password, type } = req.body;

    if(!email || !password){
        return res.status(400).json({message:"Email and password are required"});
    }

    if(!validator.isEmail(email)){
        return res.status(400).json({message:"Invalid email format"});
    }

    try{
        const result = await pool.query("SELECT * FROM users WHERE email = $1",[email]);
        if(result.rows.length === 0){
            return res.status(404).json({message:"User not found"});
        }

        const user = result.rows[0];
        const hash = user.password.replace(/^\$2y\$/, "$2b$");
        const isMatch = await bcrypt.compare(password, hash);
        if(!isMatch){
            return res.status(401).json({message:"Invalid email or password"});
        }

        const accessToken = jwt.sign(
            { id:user.id, email:user.email },
            JWT_SECRET,
            { expiresIn: "15m"}
        );

        //Generte Refresh token long-lived token
        const refreshToken = generateRefreshToken();
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRY); // 7 days expiry

        //Save refresh token into DB
        const refreshTokenHash = await bcrypt.hash(refreshToken,10);
        await pool.query(
            `INSERT INTO refresh_tokens(user_id,  token, status, expires_at, device, ip_address, user_agent) 
            VALUES($1,$2,'active',$3,$4,$5,$6)`,
            [
                user.id,
                refreshTokenHash,
                expiresAt,
                req.body.device || "Unknown",
                req.ip,
                req.headers["user-agent"] || "Unknown"
            ]
        )

        res.status(200).json({
            message: "Login successfully",
            accessToken,
            refreshToken, // plain text (only once, client should store securely)
            user: { id:user.id, name:user.name, email:user.email }, 
        });
    }catch(err: any){
        res.status(500).json({error:err.message});
    }
};

//send otp
export const sendOtp = async (req: Request, res: Response) => {
    const { phone } = req.body;
    if(!phone){
        return res.status(400).json({message : "phone number is required"});
    }
    // Indian mobile number: 10 digits, starting with 6,7,8,9
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
        return res.status(400).json({ message: "Invalid Indian phone number" });
    }

    try{
        const user = await pool.query("SELECT * from users WHERE phone = $1",[phone]);
        if(user.rows.length === 0){
            return res.status(404).json({message : "user not found"});
        }

        const user_id = user.rows[0].id;
        // generate otp
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // expiry time for otp
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

        //save otp into database
        await pool.query("INSERT INTO otps(user_id, otp, expires_at) VALUES($1,$2,$3)",[user_id,otp,expiresAt])
        //console.log(`otp for ${phone} : ${otp}`);
        res.status(200).json({message : "OTP sent successfully"});
    }catch(err: any){
        res.status(500).json({error: err.message});
    }
}

export const loginWithOtp = async (req: Request, res: Response) => {
    const {phone, otp } = req.body;

    // Required field validation
    if (!phone || !otp) {
        return res.status(400).json({ message: "Phone and OTP are required" });
    }

    // Phone format validation (basic, 10-15 digits)
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
        return res.status(400).json({ message: "Invalid phone number format" });
    }

    // OTP format validation (6 digits)
    const otpRegex = /^[0-9]{6}$/;
    if (!otpRegex.test(otp)) {
        return res.status(400).json({ message: "Invalid OTP format" });
    }

    try{
        await runTransaction( async (client : PoolClient) => {
            const userResult = await client.query("SELECT * FROM users WHERE phone = $1", [phone])
            if(userResult.rows.length === 0){
                return res.status(404).json({message : "user not found"});
            }

            const user = userResult.rows[0];


            // verify Otp
            const otpResult = await client.query(
                            `SELECT * FROM otps WHERE user_id = $1 and otp = $2 and expires_at > NOW() and used = false 
                            ORDER BY created_at DESC LIMIT 1`, [user.id, otp]);
            if(otpResult.rows.length === 0) {
                res.status(401).json({message: "Invalid or expired otp"});
            };

            //mark otp as read
            await client.query("UPDATE otps SET user = true WHERE id = $1",[otpResult.rows[0].id]);


            const accessToken = jwt.sign(
                                { id:user.id, email:user.email },
                                JWT_SECRET,
                                { expiresIn: "15m"}
                            );

            //Generte Refresh token long-lived token
            const refreshToken = generateRefreshToken();
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRY); // 7 days expiry

            //Save refresh token into DB
            const refreshTokenHash = await bcrypt.hash(refreshToken,10);
            await pool.query(
                `INSERT INTO refresh_tokens(user_id,  token, status, expires_at, device, ip_address, user_agent) 
                VALUES($1,$2,'active',$3,$4,$5,$6)`,
                [
                    user.id,
                    refreshTokenHash,
                    expiresAt,
                    req.body.device || "Unknown",
                    req.ip,
                    req.headers["user-agent"] || "Unknown"
                ]
            );
            
            res.status(200).json({
                message: "Login successfully",
                accessToken,
                refreshToken, // plain text (only once, client should store securely)
                user: { id:user.id, name:user.name, email:user.email, phone:user.phone }, 
            });
        });
    }catch(err: any){
        res.status(500).json({message : err.message});
    }

}


//Logout User
export const logoutUser = async (req: Request, res: Response) => {
    try{
        const { refreshToken } = req.body; // safe access;
        if(!refreshToken){
            return res.status(400).json({message: "Refresh token is required"});
        }

        // ✅ Check that req.user exists
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const result = await pool.query(
            "SELECT * FROM refresh_tokens WHERE user_id = $1 AND status = 'active'",
            [req.user.id]
        );
   
        if(result.rows.length === 0){    
            return res.status(401).json({message: "No active refresh token found"});
        }
        
        let matchedToken = null;
        for(let row of result.rows){
            const isMatch = await bcrypt.compare(refreshToken, row.token);
            if(isMatch){
                matchedToken = row;
                break;
            }
        }

        if(!matchedToken){
            return res.status(401).json({message: "Invalid refresh token"});
        }

        //Token revoke
        await pool.query(
            "UPDATE refresh_tokens SET status = 'revoked' WHERE id = $1",[matchedToken.id]
        );

        res.status(200).json({message: "Logged out successfully"});
    }catch(err: any){
        res.status(500).json({error:err.message});
    }
}


export const registerUser = async (req: Request, res: Response) => {
    const {name, email, password } = req.body;

    if(!name || !email || !password){
        return res.status(400).json({message: "All field are required"});
    }

    if(!validator.isEmail(email)){
        return res.status(400).json({message: "Invalid email format"});
    }

    try{
        const existingUser = await pool.query("SELECT * FROM users WHERE email = $1",[email]);
        if(existingUser.rows.length > 0){
            return res.status(409).json({message: "Email already registered"});
        }

        const hashedPassword  = await bcrypt.hash(password, 10);


        const result = await pool.query(
            "INSERT INTO users (name, email, password) VALUES($1,$2,$3) RETURNING id, name, email",
            [name, email, hashedPassword]
        );

        res.status(200).json({
            message: "User registered successfully",
            user: result.rows[0],
        });
    }catch(err: any){
        res.status(500).json({ error:err.message })
    }
}

// ---------------------- COMMON USER CREATOR ----------------------
export const createBaseUser = async (
    client: any, 
    name: string, 
    email: string, 
    phone: string, 
    password: string
) => {
    if(!name || !email || !password || !password){
        const err: any = new Error("All fields are required");
        err.statusCode = 400;
        throw err;
    }

    if(!validator.isEmail(email)){
        const err: any = new Error("Invalid email format");
        err.statusCode = 400;
        throw err;
    }

    const existing = await client.query(
        "SELECT * FROM users WHERE email = $1 OR phone = $2",
        [email, phone]
    );

    if (existing.rows.length > 0) {
        const err: any = new Error("Email or phone already registered");
        err.statusCode = 409;
        throw err;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await client.query(
        "INSERT INTO users (name, email, phone, password) VALUES ($1,$2,$3,$4) RETURNING id, name, email, phone",
        [name, email, phone, hashedPassword]
    );

    return result.rows[0];
};

// ---------------------- CUSTOMER REGISTER ----------------------
export const registerCustomer = async (req: Request, res: Response) => {
    const { name, email, phone, password, address } = req.body;

    try{
        const user = await runTransaction(async (client: PoolClient) => {
            const user = await createBaseUser(client, name, email, phone, password);
            const customerDetail = await client.query(
                "INSERT INTO customer_details(user_id, wallet_balance) VALUES($1,$2) RETURNING id",
                [user.id,0.00]
            );
            if(address){
                await client.query(
                    `INSERT INTO customer_addresses(customer_detail_id, type, address, country_id, state_id, city_id, locality_id, pincode_id)
                     VALUES($1,$2,$3,$4,$5,$6,$7,$8)`,
                    [
                        customerDetail.rows[0].id,
                        address.type || "Home",
                        address.address,
                        1,
                        address.state_id,
                        address.city_id, 
                        address.locality_id || null,
                        address.pincode_id 
                    ]
                )
            }

            //getting role for assigning
            const role = await client.query("SELECT id FROM roles WHERE name=$1 and guard_name='web'",
                ["customer"]);

            if(role.rows.length > 0){
                await client.query("INSERT into model_has_roles(role_id, model_type, model_id) VALUES($1,$2,$3)",
                    [role.rows[0].id, "App\\Models\\User",user.id]
                );
            }
            return user ;
        });
        res.status(200).json({message: "Customer registered successfully", user});
    } catch(err: any){
        res.status(500).json({ error:err.message })
    }
}

// ---------------------- VENDOR REGISTER ----------------------
export const registerVendor = async (req: Request, res: Response) => {
    const {name, email, phone, password, business_name, gst_number, pan_number} = req.body;
    
    try{
        const { user, vendor } = await runTransaction(async (client: PoolClient) => {
            const user = await createBaseUser(client, name, email, phone, password);
            const vendorDetail = await client.query(
                `INSERT INTO vendor_details(user_id, business_name, gst_number, pan_number, status) 
                VALUES($1,$2,$3,$4,'pending') RETURNING id, status`,
                [user.id, business_name, gst_number, pan_number]
            );

            //getting role for assigning
            const role = await client.query("SELECT id FROM roles WHERE name=$1 and guard_name='web'",
                ["vendor"]);

            if(role.rows.length > 0){
                await client.query("INSERT into model_has_roles(role_id, model_type, model_id) VALUES($1,$2,$3)",
                    [role.rows[0].id, "App\\Models\\User",user.id]
                );
            }
           return { user, vendor: vendorDetail.rows[0] };
        });
        res.status(200).json({
            message: "Vendor registred successfully (pending approval)",
            user,
            vendor
        });
    }catch(err: any){
        res.status(500).json({error:err.message});
    }
}

// ---------------------- DELIVERY BOY REGISTER ----------------------
export const registerDeliveryBoy = async (req: Request, res: Response) => {
    const { name, email, phone, password, vehicle_type, vehicle_number, license_number } = req.body;
    try{
        const { user, delivery } = await runTransaction(async (client: PoolClient) => {
            const user = await createBaseUser(client,name, email, phone,  password);

            const deliveryBoyDetail = await client.query(`
                INSERT INTO delivery_boy_details(user_id, vehicle_type, vehicle_number, license_number, status)
                VALUES($1,$2,$3,$4,'offline') RETURNING id, status`,[user.id, vehicle_type || "Bike", vehicle_number,
                    license_number]
                );
            //getting role for assigning
            const role = await client.query("SELECT id FROM roles WHERE name=$1 and guard_name='web'",
                ["delivery_boy"]);

            if(role.rows.length > 0){
                await client.query("INSERT into model_has_roles(role_id, model_type, model_id) VALUES($1,$2,$3)",
                    [role.rows[0].id, "App\\Models\\User",user.id]
                );
            }

            return {user, delivery:deliveryBoyDetail.rows[0] }
        });
        res.status(200).json({
            message: "Delivery boy registered successfully",
            user,
            delivery 
        });
    }catch(err: any){
        //res.status(500).json({error : err.message});
    }
}






