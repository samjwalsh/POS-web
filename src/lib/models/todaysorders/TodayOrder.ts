import mongoose from "mongoose";

const Schema = mongoose.Schema;

import Item from "./Item";

const orderSchema = new Schema(
  {
    id: {
      type: String,
      unique: true,
      required: true,
    },
    time: {
      type: Date,
      required: true,
    },
    shop: {
      type: String,
      required: true,
    },
    till: {
      type: Number,
      required: true,
    },
    deleted: {
      type: Boolean,
      required: true,
    },
    eod: {
      type: Boolean,
      required: true,
    },
    subtotal: {
      type: Number,
      required: true,
    },
    paymentMethod: {
      type: String,
      required: true,
    },
    items: {
      type: [Item],
      required: true,
    },
  },
  { collection: 'todaysorders' }
);

export default mongoose.model('todaysorders', orderSchema);
