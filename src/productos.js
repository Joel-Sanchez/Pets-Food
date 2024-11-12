import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/////////////////// Crear una nueva categoría /////////////////////////////////////
export async function createCategory(nombre, descripcion) {
    try {
        const newCategory = await prisma.categories.create({
            data: {
                nombre,
                descripcion,
            },
        });
        console.log('Nueva categoría creada:', newCategory);
        return newCategory;
    } catch (error) {
        console.error('Error al crear la categoría:', error);
        throw error;
    }
}

////////////////////// Leer todas las categorías ////////////////////////////////////
export async function getCategories() {
    try {
        const categories = await prisma.categories.findMany();
        console.log('Categorías:', categories);
        return categories;
    } catch (error) {
        console.error('Error al leer las categorías:', error);
        throw error;
    }
}

///////////////////// Actualizar una categoría /////////////////////////////////////
export async function updateCategory(categoryId, newData) {
    try {
        const updatedCategory = await prisma.categories.update({
            where: { id: categoryId },
            data: newData,
        });
        console.log('Categoría actualizada:', updatedCategory);
        return updatedCategory;
    } catch (error) {
        console.error('Error al actualizar la categoría:', error);
        throw error;
    }
}

///////////////////// Eliminar una categoría /////////////////////////////////////
export async function deleteCategory(categoryId) {
    try {
        const deletedCategory = await prisma.categories.delete({
            where: { id: categoryId },
        });
        console.log('Categoría eliminada:', deletedCategory);
        return deletedCategory;
    } catch (error) {
        console.error('Error al eliminar la categoría:', error);
        throw error;
    }
}


// Crear un producto con validaciones
export async function createProduct(codigo_barras, descripcion, cantidad, precio, categoria_id) {
    try {
        // Validar que los campos obligatorios no estén vacíos
        if (!codigo_barras || !descripcion || !categoria_id) {
            throw new Error('Código de barras, descripción y categoría son requeridos');
        }

        // Validar que la cantidad y el precio sean valores positivos
        if (cantidad < 0 || precio < 0) {
            throw new Error('La cantidad y el precio deben ser valores positivos');
        }

        // Verificar si el codigo de barras ya existe
        const existingProduct = await prisma.products.findUnique({
            where: { codigo_barras },
        });
        if (existingProduct) {
            throw new Error('El código de barras ya existe');
        }

        // Si todo es valido, crear el nuevo producto
        const newProduct = await prisma.products.create({
            data: {
                codigo_barras: codigo_barras,
                descripcion: descripcion,
                cantidad: cantidad,
                precio: precio,
                categoria_id: categoria_id,
            },
        });

        console.log('Nuevo producto creado:', newProduct);
        return { success: true, data: newProduct };
    } catch (error) {
        console.error('Error al crear producto:', error.message);
        return { success: false, message: error.message };
    }
}

// Obtener productos
export async function getProducts() {
    const products = await prisma.products.findMany();
    console.log('Productos:', products);
    return products;
}

// Actualizar un producto
export async function updateProduct(productId, newData) {
    const updatedProduct = await prisma.products.update({
        where: { id: productId }, 
        data: newData, 
    });
    console.log('Producto actualizado:', updatedProduct);
    return updatedProduct;
}

// Eliminar un producto
export async function deleteProduct(productId) {
    const deletedProduct = await prisma.products.delete({
        where: { id: productId }, 
    });
    console.log('Producto eliminado:', deletedProduct);
    return deletedProduct;
}
