-- CreateTable
CREATE TABLE "sale_details" (
    "id_venta_detalle" SERIAL NOT NULL,
    "venta_id" INTEGER NOT NULL,
    "producto_id" INTEGER NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "precio_unitario" DOUBLE PRECISION NOT NULL,
    "subtotal" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "sale_details_pkey" PRIMARY KEY ("id_venta_detalle")
);

-- AddForeignKey
ALTER TABLE "sale_details" ADD CONSTRAINT "sale_details_venta_id_fkey" FOREIGN KEY ("venta_id") REFERENCES "sales"("venta_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sale_details" ADD CONSTRAINT "sale_details_producto_id_fkey" FOREIGN KEY ("producto_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
