import { Schema, model } from "mongoose";
const tradeHistorySchema = new Schema({
  symbol: { type: String, required: true },
  price: { type: Number, required: true },
  amount: { type: Number, required: true },
  order: { type: Boolean, default: false },
  date: { type: Date, required: true },
});
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
    positions: { type: Object, default: {} }, //symbol,value
    favorites: [String],
    prefTheme: [String],
    tradeHistory: [tradeHistorySchema],
  },
  { timestamps: true }
);
userSchema.methods.toJSON = function (this: any) {
  const obj = this.toObject();
  delete obj.hashedPW;
  delete obj.__v;

  while (obj.tradeHistory.length > 5) {
    obj.tradeHistory.shift();
  }
  return obj;
};

export const User = model("User", userSchema);
