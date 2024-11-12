/*
  Warnings:

  - You are about to drop the `sale_details` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "sale_details" DROP CONSTRAINT "sale_details_producto_id_fkey";

-- DropForeignKey
ALTER TABLE "sale_details" DROP CONSTRAINT "sale_details_venta_id_fkey";

-- DropTable
DROP TABLE "sale_details";

-- CreateTable
CREATE TABLE "sale_details_tmp" (
    "id_venta_detalle" SERIAL NOT NULL,
    "venta_id" INTEGER NOT NULL,
    "producto_id" INTEGER NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "precio_unitario" DOUBLE PRECISION NOT NULL,
    "subtotal" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sale_details_tmp_pkey" PRIMARY KEY ("id_venta_detalle")
);

-- AddForeignKey
ALTER TABLE "sale_details_tmp" ADD CONSTRAINT "sale_details_tmp_producto_id_fkey" FOREIGN KEY ("producto_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sale_details_tmp" ADD CONSTRAINT "sale_details_tmp_venta_id_fkey" FOREIGN KEY ("venta_id") REFERENCES "sales"("venta_id") ON DELETE CASCADE ON UPDATE CASCADE;
