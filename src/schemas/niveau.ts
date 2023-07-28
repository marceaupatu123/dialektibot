import { Schema, model } from "mongoose";
const niveauSchema = new Schema({
  _id: String,
  points: Number,
});

export default model("Niveau", niveauSchema, "serveur");
