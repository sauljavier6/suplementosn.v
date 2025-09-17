import User from "../models/User";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";


export const register = async (req: any, res: any) => {
  try {
    const { email, password } = req.body;
    const exists = await User.findOne({where: { Email: email }});
    if (exists) return res.status(400).json({ message: "Usuario ya registrado" });

    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ Email: email, Password: hashed });
    await user.save();

    res.status(201).json({ message: "Usuario creado" });
  } catch (error) {
    res.status(500).json({ message: "Error en el servidor" });
  }
}

export const login = async (req: any, res: any) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({where: { Email: email }});
    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

    const isValid = await bcrypt.compare(password, user.Password);
    if (!isValid) return res.status(400).json({ message: "Contraseña incorrecta" });

    const token = jwt.sign({ id: user.ID_User }, process.env.JWT_SECRET!, { expiresIn: "1d" });
    res.json({ token, email: user.Email });
  } catch (error) {
    res.status(500).json({ message: "Error en el servidor" });
  }
}
