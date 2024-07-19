import { model, Schema } from "mongoose";
import { UsuarioInterface } from "../interfaces/usuario.interface";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

interface UsuarioModel extends UsuarioInterface, Document {
  compararSenhas(senha: string): Promise<Boolean>;
  gerarToken():String;
}

const UsuarioSchema = new Schema({
  nome: {
    type: String,
    required: true,
  },
  senha: {
    type: String,
    required: true,
  },
  avatar: {
    type: String,
    required: false,
  },
});

UsuarioSchema.pre<UsuarioModel>("save", async function criptografarSenha(next) {
  try {
    if (this.senha) {
      const hashedSenha = await bcrypt.hash(this.senha, 8);
      this.senha = hashedSenha;
    } else {
      throw new Error("Senha is undefined");
    }
    next();
  } catch (err) {
    next(err);
  }
});

UsuarioSchema.methods.compararSenhas = function (
  senha: string
): Promise<boolean> {
  return bcrypt.compare(senha, this.senha);
};

UsuarioSchema.methods.gerarToken = function (): string {
  const decodedToken = {
    _id: String(this._id),
    nome: this.nome,
    avatar: this.avatar,
  };

  return jwt.sign(decodedToken, 'SECRET', {
    expiresIn:'1d' 
  });
};

export default model<UsuarioModel>("Usuario", UsuarioSchema);
