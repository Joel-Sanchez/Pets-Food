import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt'; 
import jwt from 'jsonwebtoken'; 
import dotenv from 'dotenv';
import { generateToken } from './auth.js';

dotenv.config(); // Cargar variables del archivo .env

const prisma = new PrismaClient();

// Función de login
export async function loginUser(usuario, contrasena) {
    try {
        const user = await prisma.users.findUnique({
            where: { usuario: usuario },
        });

        if (!user) {
            console.log('Usuario no encontrado');
            return { success: false, message: 'Usuario no encontrado' };
        }

        const isPasswordValid = await bcrypt.compare(contrasena, user.contrasena);

        if (isPasswordValid) {
            // Crear un token JWT usando el secret de tu archivo .env
            const token = jwt.sign(
                {
                    userId: user.id, 
                    role: user.role, 
                },
                process.env.JWT_SECRET, // Secreto JWT que está en tu archivo .env
                { expiresIn: '1h' } // El token expirará en 1 hora
            );

            console.log('Inicio de sesión exitoso');
            return {
                success: true,
                message: 'Inicio de sesión exitoso',
                token: token, // Devuelve el token en la respuesta
                user: { id: user.id, usuario: user.usuario, role: user.role } // Información basica del usuario
            };
        } else {
            console.log('Contraseña incorrecta');
            return { success: false, message: 'Contraseña incorrecta' };
        }
    } catch (error) {
        console.error('Error durante el inicio de sesion:', error);
        return { success: false, message: 'Error en el servidor' };
    }
}

export default { loginUser };
