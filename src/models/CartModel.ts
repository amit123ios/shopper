import prisma from "../config/prisma";
export async function items_list(userId : number){
    const cart_items = await prisma.carts.findMany({
        where : { user_id : userId },
        select : {
            id  : true,
            quantity: true, 
            inventory_items: {
                select : {
                    id : true,
                    shop_sku : true, 
                    mrp:true, 
                    selling_price : true, 
                    discount_price : true, 
                    stock_quantity : true, 
                    stock_status : true,
                    product_variants : {
                        select : {
                            name : true,
                            products: {
                                select : {
                                    id: true, 
                                    name : true, 
                                    imageUrl: true 
                                },
                            },
                        },
                    },

                },
            },

        }
    });
    return cart_items;
    // Flatten
    /*const result = cart_items.map(item => {
        const inv = item.inventory_items;
        const variant = inv.product_variants;
        const product = variant.products;

        return {
            cart_id: item.id,
            quantity: item.quantity,
            inventory_id : inv.id,
            mrp: inv.mrp,
            selling_price: inv.selling_price,
            discount_price: inv.discount_price,
            stock_quantity: inv.stock_quantity,
            stock_status: inv.stock_status,
            variant_name: variant.name,
            product_id: product.id,
            product_name: product.name,
            product_imageUrl: product.imageUrl
        };
    });

    return result;*/
}


export async function cart_exists(userId: number, inventoryId: number){
    return await prisma.carts.findUnique({
        where : {
            user_id_inventory_item_id : { // uses @@unique composite index
                user_id : BigInt(userId),
                inventory_item_id : BigInt(inventoryId)
            }
        }
    });
}
export async function cart_update(existingCart: {id: bigint; quantity: number},qty: number){
    return await prisma.carts.update({
        where : { id : existingCart.id },
        data : { quantity: existingCart.quantity + qty }
    })
}
export async function cart_store(userId: number, shopId: number, inventoryId:number, qty:number){
    return await prisma.carts.create({
        data : {
            user_id: BigInt(userId),
            shop_id: BigInt(shopId),
            inventory_item_id: BigInt(inventoryId),
            quantity : qty
        }
    })
}
