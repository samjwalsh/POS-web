import mongoose from "mongoose";

const Schema = mongoose.Schema;

import itemSchema from "../todaysorders/Item";

const orderSchema = new Schema({
  id: {
    type: String,
    unique: true,
  },
  time: {
    type: Date,
  },
  shop: {
    type: String,
  },
  till: {
    type: Number,
  },
  deleted: {
    type: Boolean,
  },
  subtotal: {
    type: Number,
  },
  paymentMethod: {
    type: String,
  },
  items: {
    type: [itemSchema],
  },
});

export default orderSchema;