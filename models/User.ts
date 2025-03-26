import { Schema, model } from "mongoose";
const tradeHistorySchema = new Schema({
  symbol: { type: String, required: true },
  price: { type: Number, required: true },
  amount: { type: Number, required: true },
  order: { type: Boolean, default: false },
  date: { type: Date },
});
const historySchema = new Schema(
  {
    total: Number,
    date: Date,
  },
  { _id: false } // Disable _id for history subdocuments
);
const displayedToolsSchema = new Schema({
  chatAi: { type: Boolean, default: true },
  tutorial: { type: Boolean, default: true },
  quiz: { type: Boolean, default: true },
});
const userSchema = new Schema(
  {
    userName: String,
    email: { type: String, required: true, unique: true },
    method: { type: String, default: "email" },
    oldEmail: { type: String },
    password: { type: String, require: true },
    age: { type: Number, required: true },
    isVerified: { type: Boolean, default: false },
    hashedPW: { type: String, required: true },
    newPW: { type: String },
    cash: { type: Number, default: 10000 },
    history: [historySchema], //trade.id
    positions: { type: Object, default: {} }, //symbol,value
    favorites: [String],
    prefTheme: { type: [String], default: ["dark", "#00a9d7"] },
    tradeHistory: [tradeHistorySchema],
    displayedTools: displayedToolsSchema,
    icon: { type: String },
    iconColor: { type: String },
  },
  { timestamps: true }
);
userSchema.methods.toJSON = function (this: any) {
  const obj = this.toObject();
  delete obj.hashedPW;
  delete obj.oldPW;
  delete obj.__v;
  delete obj.oldEmail;
  obj.tradeHistory = obj.tradeHistory.slice(-10);
  return obj;
};

export const User = model("User", userSchema);
