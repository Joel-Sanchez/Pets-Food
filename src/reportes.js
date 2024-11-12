import ExcelJS from 'exceljs';
import path from 'path';
import fs from 'fs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function exportSalesToExcel(req, res) {
    try {
        // Crear un nuevo workbook de Excel
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Historial de Ventas');

        // Agregar encabezados de columna
        worksheet.columns = [
            { header: 'ID Venta', key: 'venta_id', width: 10 },
            { header: 'Fecha', key: 'fecha_venta', width: 20 },
            { header: 'Usuario', key: 'usuario', width: 20 },
            { header: 'Producto', key: 'producto', width: 20 },
            { header: 'Cantidad', key: 'cantidad', width: 10 },
            { header: 'Precio', key: 'precio', width: 10 },
            { header: 'Subtotal', key: 'subtotal', width: 10 },
            { header: 'Total', key: 'total', width: 10 }
        ];

        // Obtener los datos de ventas desde la base de datos
        const sales = await prisma.sales.findMany({
            include: {
                sale_details: {
                    include: {
                        products: true,
                    },
                },
                users: true,
            },
        });

        // Recorrer cada venta y agregarla a la hoja de Excel
        sales.forEach((sale) => {
            sale.sale_details.forEach((detail) => {
                worksheet.addRow({
                    venta_id: sale.venta_id,
                    fecha_venta: sale.fecha_venta,
                    usuario: sale.users.usuario, 
                    producto: detail.products.descripcion,
                    cantidad: detail.cantidad,
                    precio: detail.precio_unitario,
                    subtotal: detail.subtotal,
                    total: sale.total,
                });
            });
        });

        // Guardar el archivo Excel en el sistema de archivos
        const filePath = path.resolve('historial_ventas.xlsx'); // Genera la ruta completa del archivo
        await workbook.xlsx.writeFile(filePath);

        // Enviar el archivo Excel como respuesta
        res.download(filePath, 'historial_ventas.xlsx', (err) => {
            if (err) {
                console.error('Error al descargar el archivo:', err);
                res.status(500).send('Error al descargar el archivo');
            }

            // Eliminar el archivo del servidor despues de la descarga
            fs.unlinkSync(filePath);
        });
    } catch (error) {
        console.error('Error al generar el archivo Excel:', error);
        res.status(500).json({ message: 'Error al generar el archivo Excel' });
    }
}
