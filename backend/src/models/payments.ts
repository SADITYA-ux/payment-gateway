import mongoose, { Schema } from "mongoose";

export type paymentStatus = "pending" | "success" | "failed"
export type paymentProviderName = "mock" | "esewa" | "stripe"

export interface IPayment extends Document
{
    amount : number;
    currency : string;
    status : paymentStatus;
    provider : paymentProviderName;
    callbackUrl: string;
    metadata?: Record<string, unknown>;
    providerReference?: string;
    providerResponse?: Record<string, unknown>;
    expiresAt: Date;
    createdAt: Date;
    updatedAt: Date;
}

const paymentSchema = new Schema<IPayment>
(
{
        amount: { type: Number, required: true },
        currency: { type: String, required: true },
        status: {
            type: String,
            enum: ["pending", "success", "failed", "refunded"],
            default: "pending",
            required: true,
        },
        provider: {
            type: String,
            enum: ["mock", "esewa", "paypal"],
            required: true,
        },
        callbackUrl: { type: String, required: true },
        metadata: { type: Schema.Types.Mixed },
        providerReference: { type: String },
        providerResponse: { type: Schema.Types.Mixed },
        expiresAt: { type: Date, required: true },
    },
    { timestamps: true}
);

export const Payment = mongoose.model<IPayment>("Payment",paymentSchema);