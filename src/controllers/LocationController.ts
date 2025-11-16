//Localtion controller
import {Request, Response } from "express";
import prisma from "../config/prisma";


export const getStates = async (req: Request,res: Response): Promise<void>  => {
    try{
        const state_data = await prisma.states.findMany();
        res.status(200).json({message : "State List", data : state_data})
    }catch(err: any){
        res.status(500).json({error : err.message});
    }
}


export const getCities = async (req: Request, res: Response): Promise<void> => {
    try{
        const { stateId } = req.params;    
   
        const state_data = await prisma.cities.findMany({
            where : { state_id : BigInt(stateId) }
        });

        res.status(200).json({message : "City List", data : state_data});
    }catch(err: any){
        res.status(500).json({error : err.message});
    }
}

export const getLocalties = async (req: Request, res: Response): Promise<void> => {
    try{
        const { cityId } = req.params;
        const localties = await prisma.localities.findMany({
            where : { city_id : BigInt(cityId)}
        });
        
        res.status(200).json({message : "Localities List", data : localties});
    }catch(err: any){
        res.status(500).json({error : err.message});
    }
}

export const getPincode = async (req: Request, res: Response) => {
    let ocalityId: bigint;
    try{
        const { loc_id } = req.params;

         // Convert to number
        const localityId = BigInt(loc_id);
       
        const pincode_data = await prisma.pincodes.findMany({
            where : { locality_id : localityId }
        });

        res.status(200).json({message : "Pincode List", data : pincode_data});
    }catch(err: any){
        res.status(500).json({error : err.message});
    }
}

