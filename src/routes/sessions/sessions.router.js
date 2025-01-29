import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import User from "../../models/User.js";
import { authenticateJWT } from "../../middlewares/auth.js";

const router = express.Router();

// Registro de usuario
router.post("/register", async (req, res) => {
  try {
    const { first_name, last_name, email, age, password } = req.body;
    if (!first_name || !last_name || !email || !age || !password) {
      return res.status(400).json({ message: "Todos los campos son obligatorios" });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "El usuario ya existe" });
    }

    // Encriptar la contraseña antes de guardarla
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);  // Encriptando la contraseña

    const user = new User({ first_name, last_name, email, age, password: hashedPassword });
    await user.save();
    res.status(201).json({ message: "Usuario registrado con éxito" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error en el servidor", error });
  }
});

// Login de usuario
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Verificar si se está recibiendo el email y la contraseña en la solicitud
    console.log('Login attempt:', email, password);

    const user = await User.findOne({ email });

    // Verificar si el usuario existe
    if (!user) {
      return res.status(400).json({ message: "Credenciales incorrectas" });
    }

    // Verificar si la contraseña coincide
    const passwordMatch = await user.comparePassword(password);
    console.log("Contraseña válida:", passwordMatch);  // Ver si la contraseña coincide

    if (!passwordMatch) {
      return res.status(400).json({ message: "Credenciales incorrectas" });
    }

    //generar el token con más datos del usuario
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
        first_name: user.first_name,      
            last_name: user.last_name,     
        email: user.email,                 
          age: user.age                  
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Enviar el token y la respuesta
    res.cookie("token", token, { httpOnly: true }).json({ message: "Login exitoso", token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error en el servidor", error });
  }
});

// Ruta protegida para obtener el usuario actual
router.get("/current", authenticateJWT, (req, res) => {
  res.json({
    user: {
      id: req.user.id,
      first_name: req.user.first_name,  
      last_name: req.user.last_name,    
      email: req.user.email,            
      age: req.user.age,                
      role: req.user.role               
    }
  });
});

// Logout
router.post("/logout", (req, res) => {
  res.clearCookie("token").json({ message: "Sesión cerrada" });
});

export default router;
