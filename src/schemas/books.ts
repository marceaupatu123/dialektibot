import { Schema, model } from "mongoose";
const booksSchema = new Schema({
  _id: String,
  price: Number,
  sells: Number,
  authorID: String,
  editionHouse: String,
  threadID: String,
});

export default model("Livres", booksSchema, "books");
