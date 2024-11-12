import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Historial de ventas filtrado por fechas, usuarios o categorías
export async function getSalesHistory({ fechaInicio, fechaFin, usuarioId, categoriaId }) {
    try {
        const sales = await prisma.sales.findMany({
            where: {
                AND: [
                    fechaInicio ? { fecha_venta: { gte: new Date(fechaInicio) } } : {},
                    fechaFin ? { fecha_venta: { lte: new Date(fechaFin) } } : {},
                    usuarioId ? { usuario_id: usuarioId } : {},
                    categoriaId ? {
                        sale_details: {
                            some: {
                                products: {
                                    categoria_id: categoriaId
                                }
                            }
                        }
                    } : {},
                ]
            },
            include: {
                sale_details: {
                    include: {
                        products: true,
                    }
                },
                users: true, // Incluir los detalles del usuario que realizó la venta
            },
        });

        return sales;
    } catch (error) {
        console.error('Error al obtener historial de ventas:', error);
        throw error;
    }
}

// Reporte de productos más vendidos
export async function getTopSellingProducts() {
    try {
        const topProducts = await prisma.products.findMany({
            orderBy: {
                contador_ventas: 'desc',
            },
            take: 10, // Número de productos más vendidos
        });

        return topProducts;
    } catch (error) {
        console.error('Error al obtener productos más vendidos:', error);
        throw error;
    }
}

// Reporte de ingresos por día, mes, etc.
export async function getSalesByDateRange({ fechaInicio, fechaFin, intervalo }) {
    try {
        const salesByDate = await prisma.sales.groupBy({
            by: [intervalo], 
            where: {
                AND: [
                    fechaInicio ? { fecha_venta: { gte: new Date(fechaInicio) } } : {},
                    fechaFin ? { fecha_venta: { lte: new Date(fechaFin) } } : {},
                ]
            },
            _sum: {
                total: true, // Sumar el total de las ventas
            }
        });

        return salesByDate;
    } catch (error) {
        console.error('Error al obtener reportes de ventas:', error);
        throw error;
    }
}
