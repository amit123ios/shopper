import prisma from "../config/prisma";
export async function productDetail (inventoryId: number) {
    return await prisma.inventory_items.findUnique({
        where : {id : BigInt(inventoryId)},
        select : {
            id:true,
            mrp : true, 
            selling_price : true, 
            discount_price : true, 
            is_tracked : true, 
            stock_quantity : true, 
            stock_status : true,
            product_variants : {
                select : {
                    name : true, 
                    sku : true, 
                    weight : true,
                    volume : true, 
                    products : {
                        select : {
                            id : true,
                            name : true,
                            slug : true,  
                            brand : true, 
                            unit : true,
                            imageUrl : true,
                            categories : {
                                select : {
                                    name: true,
                                    slug : true
                                },
                            },
                        },
                    },
                },
            },
        },
    });
}

export async function getInventory(inventoryId: number){
    return await prisma.inventory_items.findUnique({
        where : {id : BigInt(inventoryId), stock_status : {in : ['in_stock','low_stock']}, is_active : true },
        select : {id: true, shop_id:true, product_variant_id:true}
    });
}

export async function getProductById(productId: number){
    return await prisma.products.findUnique({
        where : { id:productId },
        select : { 
            id : true, 
            name : true, 
            brand: true, 
            is_active:true,
            product_variants : {
                select : {
                    id: true, 
                    name: true, 
                    inventory_items: {
                        select : {
                            id : true, 
                            shop_id : true
                        }, 
                    },
                },
            },
        },
    });
}


export async function relatedProducts(inventoryId: number, shopId: number, limit = 4){
    return await prisma.inventory_items.findMany({
        where : {
            shop_id : shopId, 
            stock_status : {in : ['in_stock','low_stock']}, 
            id : { not : inventoryId },
            is_active : true 
        },
        take:limit,
        select : {
            id : true,
            mrp : true, 
            selling_price : true, 
            discount_price : true, 
            is_tracked : true, 
            stock_quantity : true, 
            stock_status : true,
            product_variants : {
                select : {
                    id: true, 
                    name : true, 
                    product_id : true, 
                    products : {
                        select : {
                            id: true, 
                            name : true, 
                            imageUrl:true
                        }, 
                    },
                },
            },
        },
    });
}   
