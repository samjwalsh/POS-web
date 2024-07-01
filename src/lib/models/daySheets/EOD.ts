import mongoose from "mongoose";

const Schema = mongoose.Schema;

import orderSchema from "./Order";

const EOD = new Schema({
  shop: {
    type: String,
  },
  orders: {
    type: [orderSchema],
  }
});

export default EOD;