import { Schema, model } from "mongoose";
const dialekticoinSchema = new Schema({
  _id: String,
  coins: Number,
});

export default model("Dialekticoin", dialekticoinSchema, "dialekticoin");
