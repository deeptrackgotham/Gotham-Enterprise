import mongoose, { Schema, Document } from "mongoose";

export interface IPayment extends Document {
  reference: string;
  clerkId?: string;
  email?: string;
  amount: number;
  currency: string;
  credits: number;
  status: string;
  processed: boolean;
  raw?: any;
  createdAt: Date;
  updatedAt: Date;
}

const paymentSchema = new Schema<IPayment>(
  {
    reference: { type: String, required: true, unique: true },
    clerkId: { type: String },
    email: { type: String },
    amount: { type: Number, required: true },
    currency: { type: String, required: true },
    credits: { type: Number, default: 0 },
    status: { type: String },
    processed: { type: Boolean, default: false },
    raw: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

export const Payment = mongoose.models?.Payment || mongoose.model("Payment", paymentSchema);
