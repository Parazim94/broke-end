import { Schema, model } from "mongoose";
const deletedTokenSchema = new Schema({
  token: String,
});

export const DeletedToken = model("old token", deletedTokenSchema);
