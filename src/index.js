import express from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { loginUser } from './login.js';
import { createProduct, getProducts, updateProduct, deleteProduct, createCategory, getCategories, updateCategory, deleteCategory } from './productos.js'; // Importa las funciones de productos.js
import { getSalesHistory, getTopSellingProducts, getSalesByDateRange } from './salesReports.js'; // Importa las funciones
import { exportSalesToExcel } from './reportes.js';
import cors from 'cors';

const prisma = new PrismaClient();

const app = express();

// Permitir el acceso desde cualquier origen
app.use(cors({
    origin: 'http://localhost:3000', 
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Métodos permitidos
    credentials: true, 
}));


// Ruta para obtener todos los productos
app.get('/api/productos', async (req, res) => {
    try {
        const productos = await prisma.products.findMany();
        res.json(productos);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener los productos' });
    }
});


// Middleware para manejar JSON
app.use(express.json());

//ruta para Login
app.post('/api/login', async (req, res) => {
    const { usuario, contrasena } = req.body;

    const result = await loginUser(usuario, contrasena);

    res.json(result);
});


// Ruta para exportar las ventas a Excel
app.get('/api/sales/export', exportSalesToExcel);

// Ruta para obtener el historial de ventas
app.get('/api/sales/history', async (req, res) => {
    const { fechaInicio, fechaFin, usuarioId, categoriaId } = req.query; // Parámetros de filtro

    try {
        const sales = await getSalesHistory({ fechaInicio, fechaFin, usuarioId, categoriaId });
        res.status(200).json(sales);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Ruta para obtener productos mas vendidos
app.get('/api/sales/top-products', async (req, res) => {
    try {
        const topProducts = await getTopSellingProducts();
        res.status(200).json(topProducts);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Ruta para obtener ingresos por rango de fechas
app.get('/api/sales/report', async (req, res) => {
    const { fechaInicio, fechaFin, intervalo } = req.query;

    try {
        const salesReport = await getSalesByDateRange({ fechaInicio, fechaFin, intervalo });
        res.status(200).json(salesReport);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});




// Crear la venta
async function createSale(products, usuario_id) {
    try {
        let total = 0;
        let saleDetails = [];

        // Procesar cada producto en la venta
        for (const productInfo of products) {
            const { productId, codigo_barras, cantidad } = productInfo;

            // Buscar el producto por ID o por codigo de barras
            let product;
            if (productId) {
                product = await prisma.products.findUnique({
                    where: { id: productId },
                });
            } else if (codigo_barras) {
                product = await prisma.products.findUnique({
                    where: { codigo_barras: codigo_barras },
                });
            }

            // Validar que se encontro el producto
            if (!product) {
                throw new Error(`Producto no encontrado: ${productId || codigo_barras}`);
            }

            // Validar la cantidad
            if (cantidad <= 0 || cantidad > product.cantidad) {
                throw new Error(`Cantidad no válida para el producto: ${product.descripcion}`);
            }

            // Calcular subtotal y actualizar el total
            const subtotal = product.precio * cantidad;
            total += subtotal;

            // detalles dre la venta
            saleDetails.push({
                producto_id: product.id,
                cantidad: cantidad,
                precio_unitario: product.precio,
                subtotal: subtotal,
            });

            // Reducir la cantidad del producto en el inventario
            await prisma.products.update({
                where: { id: product.id },
                data: {
                    cantidad: product.cantidad - cantidad,
                    contador_ventas: product.contador_ventas + cantidad,
                },
            });
        }

        // Crear la venta
        const sale = await prisma.sales.create({
            data: {
                usuario_id: usuario_id,
                fecha_venta: new Date(),
                hora: new Date(),
                total: total,
                efectivo: 0,
                cambio: 0, 
                sale_details: {
                    create: saleDetails, // Agregar los detalles de la venta
                },
            },
        });

        console.log('Venta creada:', sale);
        return sale;
    } catch (error) {
        console.error('Error al crear la venta:', error);
        throw error;
    }
}

// Ruta para crear una venta
app.post('/api/sales', async (req, res) => {
    const { products, usuario_id } = req.body; // Extrae los datos del cuerpo de la solicitud
    try {
        const sale = await createSale(products, usuario_id); // Llama a la función createSale
        res.status(201).json(sale); // Responde con el objeto de venta creado
    } catch (error) {
        res.status(500).json({ error: error.message }); 
}});

// Crear un Registro en la tabla Users con validaciones 
async function createUser(usuario, contrasena, name) {
    try {
        // Validar que los campos obligatorios no estén vacíos
        if (!usuario || !contrasena || !name) {
            throw new Error('Usuario, contraseña y nombre son requeridos');
        }

        // Validar que la contraseña tenga al menos 8 caracteres
        if (contrasena.length < 8) {
            throw new Error('La contraseña debe tener al menos 8 caracteres');
        }

        // Verificar si el usuario ya existe
        const existingUser = await prisma.users.findUnique({
            where: { usuario },
        });
        if (existingUser) {
            throw new Error('El usuario ya existe');
        }

        // Si todo es valido, encriptar la contraseña y crear el nuevo usuario
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(contrasena, saltRounds);

        const newUser = await prisma.users.create({
            data: {
                usuario: usuario,
                contrasena: hashedPassword, // Guardar la contraseña encriptada
                name: name, // Incluir el nombre del usuario
            },
        });

        console.log('Nuevo usuario creado:', newUser);
        return { success: true, data: newUser };
    } catch (error) {
        console.error('Error al crear usuario:', error.message);
        return { success: false, message: error.message };
    }
}
// Leer Registros de la Tabla Users 
async function getUsers() {
    const users = await prisma.users.findMany();
    console.log('Usuarios:', users);
}

// Actualizar un registro 
async function updateUser(userId, newData) {
    const updatedUser = await prisma.users.update({
        where: { id: userId }, 
        data: newData, 
    });
    console.log('Usuario actualizado:', updatedUser);
}

// Eliminar un Registro 
async function deleteUser(userId) {
    const deletedUser = await prisma.users.delete({
        where: { id: userId }, 
    });
    console.log('Usuario eliminado:', deletedUser);
}


async function main() {
    try {
        // Crear un nuevo usuario
        //await createUser('chocopan', 'chocopan', 'joel');

        //iniciar sesión
        //const loginResult = await loginUser('chocopan', 'chocopan');
        //console.log(loginResult.message); //mensaje de inicio de sesión

        // Listar todos los usuarios
        await getUsers();    
        //creacion de la categoria
        //const newCategory = await createCategory('Categoría de Alimentos', 'Productos comestibles para mascotas');
                // Crear una nueva categoría
        //await createCategory('Accesorios', 'Categoría de accesorios para mascotas');
        
        // // Listar todas las categorías
        //const categories = await getCategories();
       

        // // Actualizar una categoría (id, nombre)
        // await updateCategory(1, { nombre: 'Alimentos y Bebidas' });

        // // Eliminar una categoría (id)
        // await deleteCategory(2);
        //crear un producto (codigo de barras, Nombre, cantidad, precio, categoria)
        //await createProduct('5412323', 'Producto Ejemplo1', 10, 19.99, 1);

        // Leer productos
        //await getProducts();  

        // Actualizar producto ()
        //await updateProduct(2, { /* codigo_barras:'456', descripcion: 'producto456',  precio: 20, categoria_id: 3, */ cantidad: 10, }); 

        // Eliminar producto
        //await deleteProduct(1);

        // await updateUser(1, { usuario: 'nuevo_usuario_actualizado', contrasena: 'nueva_contrasena' });  // Actualiza un usuario

        // Elimina un usuario
        //await deleteUser(5);  

         //creacion de la venta
        //  const products = [
        //     { productId: 2, cantidad: 5 }, // Producto con ID 1 y cantidad 2
        //     { codigo_barras: '456', cantidad: 5 }, // Producto con código de barras '123456789' y cantidad 1
        // ];
        
        // const usuario_id = 4; // ID del usuario que realiza la venta
        
        // await createSale(products, usuario_id);
        
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect(); // Cierra la conexion a la base de datos
    }
}

main();



//para correr el servidor
const PORT = process.env.PORT || 5000; 

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});





