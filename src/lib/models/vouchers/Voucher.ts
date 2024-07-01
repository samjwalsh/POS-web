import mongoose from "mongoose";

const Schema = mongoose.Schema;

const voucherSchema = new Schema(
  {
    dateCreated: {
        type: String
    },
    shopCreated: {
        type: String
    },
    tillCreated: {
        type: Number
    },
    value : {
        type: Number
    },
    code: {
        type: String,
        unique: true,
    },
    redeemed: {
        type: Boolean,
    },
    dateRedeemed: {
        type: String
    },
    shopRedeemed: {
        type: String
    },
    tillRedeemed: {
        type: Number
    },
  },
  { collection: 'vouchers' }
);

export default mongoose.model('vouchers', voucherSchema);
