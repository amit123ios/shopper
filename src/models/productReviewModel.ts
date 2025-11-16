import prisma from "../config/prisma";

export async function productReviewsByIds(shopId: number, productId: number){
    return await prisma.product_reviews.findMany({
        where : { 
            shop_id : BigInt(shopId), 
            product_id : BigInt(productId),
            shops : {id : BigInt(shopId)},
            products:{id : BigInt(productId)}
        },
        select : {
            id: true, 
            rating: true, 
            comment : true,
            created_at : true,  
            images : true,
            users : {
                select : {
                    id : true, 
                    name : true, 
                }
            }
        }
    })
}
