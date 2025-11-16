import { Request, Response } from "express";
import { getAll, getByCategory, getById } from "../models/shopModel";

export const getShops = async (req: Request, res: Response): Promise<void> => {
    const { categoryId } = req.params;
    try{
        let shops;
        if(categoryId){
            shops = await getByCategory(BigInt(categoryId));
        }else{
            shops = await getAll();
        }

        res.status(200).json({message : "Shop List with Products", data: shops});
    } catch (err: any){
        res.status(500).json({error : err.message});
    }
}


export const getShopProducts = async (req: Request, res: Response): Promise<void> => {
    const {shopId} = req.params;
    try{
        if (!shopId) throw new Error("shopId is required");

        const shop = await getById(BigInt(shopId));
        res.status(200).json({message : "Shop Data", data: shop});
    }catch(err: any){
        res.status(500).json({error: err.message});
    }
}
