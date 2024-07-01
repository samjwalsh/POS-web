import mongoose from "mongoose";

const Schema = mongoose.Schema;

import Item from "./Item";

const orderSchema = new Schema(
  {
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
    eod: {
      type: Boolean,
    },
    subtotal: {
      type: Number,
    },
    paymentMethod: {
      type: String,
    },
    items: {
      type: [Item],
    },
  },
  { collection: 'todaysorders' }
);

export default mongoose.model('todaysorders', orderSchema);
