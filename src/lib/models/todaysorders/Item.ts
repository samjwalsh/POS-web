import mongoose from "mongoose";

const Schema = mongoose.Schema;

const itemSchema = new Schema({
  name: {
    type: String,
  },
  price: {
    type: Number,
  },
  quantity: {
    type: Number,
  },
  addons: {
    type: [String],
  },
});

export default itemSchema;
