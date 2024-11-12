-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "usuario" TEXT NOT NULL,
    "contrasena" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" SERIAL NOT NULL,
    "codigo_barras" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "precio" DOUBLE PRECISION NOT NULL,
    "contador_ventas" INTEGER NOT NULL DEFAULT 0,
    "categoria_id" INTEGER NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sales" (
    "venta_id" SERIAL NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "fecha_venta" TIMESTAMP(3) NOT NULL,
    "hora" TIMESTAMP(3) NOT NULL,
    "total" DOUBLE PRECISION NOT NULL,
    "efectivo" DOUBLE PRECISION NOT NULL,
    "cambio" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "sales_pkey" PRIMARY KEY ("venta_id")
);

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

-- CreateIndex
CREATE UNIQUE INDEX "users_usuario_key" ON "users"("usuario");

-- CreateIndex
CREATE UNIQUE INDEX "products_codigo_barras_key" ON "products"("codigo_barras");

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_categoria_id_fkey" FOREIGN KEY ("categoria_id") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales" ADD CONSTRAINT "sales_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sale_details" ADD CONSTRAINT "sale_details_venta_id_fkey" FOREIGN KEY ("venta_id") REFERENCES "sales"("venta_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sale_details" ADD CONSTRAINT "sale_details_producto_id_fkey" FOREIGN KEY ("producto_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
