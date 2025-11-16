// config/prisma.ts
import { PrismaClient } from "../../generated/prisma";
import getFileUrl from "../utils/fileUrl";

const prisma = new PrismaClient().$extends({
  result: {
    products: {
      imageUrl: {
        needs: { image: true },
        compute(product) {
          return product.image ? getFileUrl(product.image, "products") : null;
        },
      },
    },
    shops: {
      logoUrl: {
        needs: { logo: true },
        compute(shop) {
          return shop.logo ? getFileUrl(shop.logo, "shops") : null;
        },
      },
    },
  },
});

export default prisma;
