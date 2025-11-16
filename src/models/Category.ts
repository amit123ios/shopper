import prisma from "../config/prisma";

export async function getCategories(){
    return await prisma.categories.findMany({
        select : {
            id : true, 
            name : true,
            image : true,
            slug : true
        }
    });
}
