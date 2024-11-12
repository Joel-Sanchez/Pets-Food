/*
  Warnings:

  - You are about to drop the `sale_details_tmp` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "sale_details_tmp" DROP CONSTRAINT "sale_details_tmp_producto_id_fkey";

-- DropForeignKey
ALTER TABLE "sale_details_tmp" DROP CONSTRAINT "sale_details_tmp_venta_id_fkey";

-- DropTable
DROP TABLE "sale_details_tmp";
