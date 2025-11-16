import { Request, Response } from "express";
import {items_list, cart_exists,cart_update,cart_store } from "../models/CartModel";
import {getInventory} from "../models/productModel";

export const getCartDetail = async (req : Request,res: Response): Promise<void> => {
    try{
        const userId = (req as any).user?.id; 
        if(!userId) {
            res.status(401).json({error : "Authenticated user required"});
            return;
        }
        
        const cart_detail = await items_list(userId);
        res.status(200).json({message : "item list", data : cart_detail});
    }catch(err: any){
        res.status(500).json({message : err.message});
    }
}

export const addToCart = async (req : Request,res : Response): Promise<void> => {
    console.log(req.body);
    const {shopId, inventoryId, qty} = req.body;
    if(!shopId || !inventoryId || !qty) {
        res.status(400).json({error : "All field are required shopId , inventoryId, qty "});
        return;
    }
    
    try{
        const inventory_item = await getInventory(inventoryId);
        if (!inventory_item) {
            res.status(404).json({ error: 'Inventory item does not exist' });
            return;
        }

        const userId = (req as any).user?.id;
        const existingCart = await cart_exists(userId, inventoryId);
        if(existingCart){
            // Update quantity if already in cart
            const updateCart = await cart_update(existingCart, qty);
            res.status(200).json({message: "Cart updated" , data : updateCart});
            return;
        }

        const cart_data = await cart_store(userId, shopId, inventoryId, qty);
        res.status(200).json({message : "item added into cart", data : cart_data});
    }catch(err: any){
        res.status(500).json({error: err.message});
    }
}
