-- DropForeignKey
ALTER TABLE "sale_details_tmp" DROP CONSTRAINT "sale_details_tmp_venta_id_fkey";

-- AlterTable
ALTER TABLE "sale_details_tmp" ALTER COLUMN "venta_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "sale_details_tmp" ADD CONSTRAINT "sale_details_tmp_venta_id_fkey" FOREIGN KEY ("venta_id") REFERENCES "sales"("venta_id") ON DELETE SET NULL ON UPDATE CASCADE;
