import { Schema, model } from "mongoose";

const userSchema = new Schema(
  {
    userName: String,
    email: { type: String, required: true, unique: true },
    password: { type: String, require: true },
    age: { type: Number, required: true },
    isVerified: { type: Boolean, default: false },
    hashedPW: { type: String, required: true },
    cash: { type: Number, default: 10000 },
    history: [Number], //trade.id
    positions: [Object], //coin.id amount
    favorites: [String],
    token: { type: String },
  },
  { timestamps: true }
);
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.hashedPW;
  delete obj.__v;
  return obj;
};

export const User = model("User", userSchema);
