import mongoose from "mongoose";

const Schema = mongoose.Schema;

import EOD from "./EOD";

const daySchema = new Schema(
  {
    date: {
      type: String,
      unique: true,
    },
    shops: {
      type: [EOD],
    },
  },
  { collection: 'daysheets' }
);

export default  mongoose.model('daysheets', daySchema);
