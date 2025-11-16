import {Request, Response } from "express";
import {productDetail, relatedProducts, getProductById, getInventory} from "../models/productModel";
import {productReviewsByIds} from "../models/productReviewModel";

export const getProductDetail = async (req: Request, res: Response): Promise<void> => {
    const { inventoryId } = req.params;
    try{
        if (!inventoryId){
            res.status(400).json({messag : "inventoryId is required"});
        } 
        
        const inventoryIdNum = Number(inventoryId);
        if (isNaN(inventoryIdNum)) {
            res.status(400).json({message: "inventoryId must be a valid number"});
        }
        const item_data = await productDetail(inventoryIdNum);
        if(!item_data){
            res.status(404).json({message : "Product data not found"});
        }

        res.status(200).json({message : "Product Data", data : item_data});
    }catch(err: any){
        res.status(500).json({error : err.message});
    }
}

export const getProductReview = async (req: Request, res: Response): Promise<void> => {
    const {shopId, productId} = req.params;
    try{
        if(!shopId || !productId) {
            res.status(400).json({message: "ShopId and ProductId are required"});
        }
        
        // Convert strings to numbers
        const shopIdNum = Number(shopId);
        const productIdNum = Number(productId);

        if (isNaN(shopIdNum) || isNaN(productIdNum)) {
            res.status(400).json({message : "ShopId and ProductId must be valid numbers"});
        }

        const review_data = await productReviewsByIds(shopIdNum, productIdNum);
        if(!review_data){
            res.status(404).json({message : "Review data not available"});
        }

        res.status(200).json({message : "Review data", data: review_data});
    }catch(err: any){
        res.status(500).json({error:err.message});
    }
}

export const getRelatedProduct = async (req: Request, res: Response) =>{
    try{
        const inventoryId = Number(req.params.inventoryId);
        if(isNaN(inventoryId)){
            return res.status(400).json({message: "Invalid product ID"});
        }
        const inventory = await getInventory(inventoryId);
        if(!inventory) {
            return res.status(404).json({message : "Product not found"});
        }

        const inventory_id = Number(inventory.id);
        const shop_id = Number(inventory.shop_id);
        const related = await relatedProducts(inventory_id, shop_id);
        res.status(200).json({message: "Related Product List", data: related});
    }catch(err : any){
        res.status(500).json({message: err.message});
    }
}


