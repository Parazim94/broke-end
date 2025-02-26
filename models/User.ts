import { Schema, model } from "mongoose";

const historySchema = new Schema(
  {
    total: Number,
    date: Date,
  },
  { _id: false } // Disable _id for history subdocuments
);
const userSchema = new Schema(
  {
    userName: String,
    email: { type: String, required: true, unique: true },
    password: { type: String, require: true },
    age: { type: Number, required: true },
    isVerified: { type: Boolean, default: false },
    hashedPW: { type: String, required: true },
    cash: { type: Number, default: 10000 },
    history: [historySchema], //trade.id
    positions: { type: Object, default: { Object } }, //symbol,value
    favorites: [String],
    prefTheme: [String],
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
