import prisma from "../config/prisma";

export async function getAll() {
  return await prisma.shops.findMany({
    orderBy : {
      id : "asc"
    },
    select: {
      id: true,
      name: true,
      address_line: true,
      logoUrl : true,
      banner : true,
      inventory_items: {   // 👈 nested correctly inside `select`
        select: {
          id:true,
          mrp: true,
          selling_price: true,
          stock_quantity: true,
          low_stock_threshold: true,
          stock_status: true,
          product_variants : {
            select : {
              id:true,
              name : true,
              sku : true,
              products : {
                select : {
                  id: true,
                  name : true,
                  brand : true,
                  imageUrl : true
                },
              },
            },
          },
        },
      },
    },
  });
}


export async function getByCategory(categoryId: number | bigint ) {
  const category = await prisma.categories.findUnique({
    where: { id: BigInt(categoryId) },
    include: {
      category_shop: {
        include: {
          shops: {
            select : {
              id: true,
              name: true,
              slug: true,
              address_line: true,
              logoUrl : true,
              banner : true,
              inventory_items: {   // 👈 nested correctly inside `select`
                select: {
                  id:true,
                  mrp: true,
                  selling_price: true,
                  stock_quantity: true,
                  low_stock_threshold: true,
                  stock_status: true,
                  product_variants : {
                    select : {
                      name : true,
                      sku : true,
                      products : {
                        select : {
                          id: true,
                          name : true,
                          brand : true,
                          imageUrl : true,
                        },
                      },
                    },
                  },
                },
              },
            },
          }, // pivot ke andar se shops fetch karenge
        },
      },
    },
  });

  // shops array extract karne ke liye:
  return category?.category_shop.map(cs => cs.shops) || [];
}

export async function getById(shopId: number | bigint){
  return await prisma.shops.findUnique({
    where : { id : BigInt(shopId) },
    select : {
      id: true,
      name: true,
      slug: true,
      address_line: true,
      logoUrl : true,
      banner : true,
      inventory_items: {   // 👈 nested correctly inside `select`
        select: {
          id:true,
          mrp: true,
          selling_price: true,
          stock_quantity: true,
          low_stock_threshold: true,
          stock_status: true,
          product_variants : {
            select : {
              name : true,
              sku : true,
              products : {
                select : {
                  id: true,
                  name : true,
                  brand : true,
                  imageUrl : true,
                },
              },
            },
          },
        },
      },
    },
  })
}


