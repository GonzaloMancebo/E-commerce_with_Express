// src/models/User.js
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema({
  first_name: String,
  last_name: String,
  email: { type: String, unique: true },
  age: Number,
  password: String,
  cart: { type: mongoose.Schema.Types.ObjectId, ref: 'Cart' },
  role: { type: String, default: 'user' },
});

userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);  // Compara la contraseña encriptada con la ingresada
};

const User = mongoose.model('User', userSchema);
export default User;
