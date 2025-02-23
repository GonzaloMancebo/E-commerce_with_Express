import jwt from "jsonwebtoken";
import User from "../models/User.js"; // Importa el modelo de usuario

export const authenticateJWT = async (req, res, next) => {
  const token = req.cookies.token || req.header("Authorization")?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Acceso no autorizado. Token no encontrado." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ message: "Usuario no encontrado." });
    }

    req.user = {
      id: user._id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      age: user.age,
      role: user.role
    };

    next();
  } catch (error) {
    console.error(error);
    return res.status(403).json({ message: "Token inválido o expirado." });
  }
};
