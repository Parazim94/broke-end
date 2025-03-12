import { Schema, model } from "mongoose";

const errorSchema = new Schema({
  date: Date,
  error: String,
});

export const Error = model("error", errorSchema);
