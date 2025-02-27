import { Schema, model } from "mongoose";

const ordersSchema = new Schema({
  symbol: { type: String, required: true },
  amount: { type: Number, required: true },
  threshold: { type: Number, required: true },
  user_id: { type: String, required: true },
});

export const Order = model("Order", ordersSchema);
