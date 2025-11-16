//controller/HomeController.js
import { Request, Response } from "express";
import { getCategories } from "../models/Category";

export const category_data = async (req: Request,res: Response): Promise<void> => {
    try{
        const categories = await getCategories();
        res.status(200).json({message: "Category List", data: categories});
    }catch(err: any){
        res.status(500).json({error: err.message})
    }
};

