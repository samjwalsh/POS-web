import mongoose from "mongoose";

const Schema = mongoose.Schema;

import endOfDaySchema from "./EOD";

const daySchema = new Schema(
  {
    date: {
      type: String,
      unique: true,
    },
    shops: {
      type: [endOfDaySchema],
    },
  },
  { collection: 'daysheets' }
);

export default mongoose.model('daysheets', daySchema);
