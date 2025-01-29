import jwt from 'jsonwebtoken';
import User from '../models/User.js'; // Importa el modelo de usuario

export const authenticateJWT = async (req, res, next) => {
  // Obtenemos el token de las cookies o del encabezado Authorization
  const token = req.cookies.token || req.header('Authorization')?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: "Acceso no autorizado. Token no encontrado." });
  }

  try {
    // Verificar y decodificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Obtener los datos completos del usuario desde la base de datos
    const user = await User.findById(decoded.id);

    // Si no encontramos el usuario
    if (!user) {
      return res.status(401).json({ message: "Usuario no encontrado." });
    }

    // Agregar los datos completos del usuario a req.user
    req.user = {
      id: user._id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      age: user.age,
      role: user.role
    };

    // Continuar con la siguiente función de middleware
    next();
  } catch (error) {
    console.error(error);
    return res.status(403).json({ message: "Token inválido o expirado." });
  }
};
