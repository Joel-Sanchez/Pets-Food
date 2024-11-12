import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config(); // Carga las variables de entorno

// Función para generar el token JWT
const generateToken = (user) => {
    return jwt.sign(
        { id: user.id, rol: user.rol }, // Datos del usuario a incluir en el token
        process.env.JWT_SECRET,          // Secreto del token
        { expiresIn: '1h' }              // Expiración del token (1 hora)
    );
};

// Middleware para verificar el token JWT
const verifyToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1]; // Obtener el token del header

    if (!token) {
        return res.status(403).json({ message: 'Autenticación requerida' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Token no válido' });
        }

        req.user = decoded; // Guardar la información decodificada del token en `req.user`
        next(); // Avanzar al siguiente middleware
    });
};

// Middleware para verificar roles
const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if (!allowedRoles.includes(req.user.rol)) {
            return res.status(403).json({ message: 'Acceso denegado' });
        }
        next(); // Avanzar al siguiente middleware si el rol es válido
    };
};

export { generateToken, verifyToken, authorizeRoles };
