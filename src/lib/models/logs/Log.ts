import mongoose from "mongoose";

const Schema = mongoose.Schema;

const logSchema = new Schema(
  {
    time: {
      type: Date,
    },
    shop: {
      type: String,
    },
    till: {
      type: Number,
    },
    note: {
      type: String,
    },
    objsOfInterest: {
      type: Array,
    },
    errMsg: {
      type: String,
    },
  },
  { collection: 'logs' }
);

export default mongoose.model('logs', logSchema);
