import type { Request, Response } from "express";
import { fromPromise } from "neverthrow";
import { Payment } from "../models/payments.js";
import { getProvider } from "../providers/index.js";
import type { paymentProviderName } from "../models/payments.js";
import crypto from "crypto";
import { esewaProvider } from "../providers/esewa.js";

const PENDING_EXPIRY_MINUTES = 15;

export const createPayment = async (req: Request, res: Response) => {
    const { amount, currency, callbackUrl, metadata, provider } = req.body as {
        amount: number;
        currency: string;
        callbackUrl: string;
        metadata?: Record<string, unknown>;
        provider: paymentProviderName;
    };

    if (!amount || !currency || !callbackUrl || !provider) {
        return res.status(400).json({ message: "Missing required fields" });
    }

    const expiresAt = new Date(Date.now() + PENDING_EXPIRY_MINUTES * 60 * 1000);

    const createResult = await fromPromise(
        Payment.create({
            amount,
            currency,
            callbackUrl,
            ...(metadata !== undefined ? { metadata } : {}),
            provider,
            status: "pending",
            expiresAt,
        }),
        (err) => {
            console.log("PAYMENT CREATE ERROR:", err);
            return new Error("Database Error");
        }
    );

    if (createResult.isErr()) {
        return res.status(500).json({ message: createResult.error.message });
    }

    const newPayment = createResult.value;
    const providerImpl = getProvider(provider);

    const providerResult = await fromPromise(
        providerImpl.createPayment(
            amount,
            currency,
            newPayment._id.toString(),
            callbackUrl
        ),
        (err) => {
            console.log("PROVIDER CREATE ERROR:", err);
            return new Error("Provider Error");
        }
    );

    if (providerResult.isErr()) {
        return res.status(500).json({ message: providerResult.error.message });
    }

    newPayment.providerReference = providerResult.value.providerReference;

    const saveResult = await fromPromise(
        newPayment.save(),
        (err) => {
            console.log("PAYMENT SAVE ERROR:", err);
            return new Error("Database Error");
        }
    );

    if (saveResult.isErr()) {
        return res.status(500).json({ message: saveResult.error.message });
    }

    return res.status(201).json({
        paymentId: newPayment._id,
        provider,
        ...providerResult.value,
    });
};

export const getPaymentStatus = async (req: Request, res: Response) => {
    const { paymentId } = req.params;

    const findResult = await fromPromise(
        Payment.findById(paymentId),
        (err) => {
            console.log("PAYMENT FIND ERROR:", err);
            return new Error("Database Error");
        }
    );

    if (findResult.isErr()) {
        return res.status(500).json({ message: findResult.error.message });
    }

    const payment = findResult.value;

    if (!payment) {
        return res.status(404).json({ message: "Payment not found" });
    }

    if (payment.status === "pending" && payment.expiresAt < new Date()) {
        payment.status = "failed";

        const expireResult = await fromPromise(
            payment.save(),
            (err) => {
                console.log("PAYMENT EXPIRE SAVE ERROR:", err);
                return new Error("Database Error");
            }
        );

        if (expireResult.isErr()) {
            return res.status(500).json({ message: expireResult.error.message });
        }
    }

    return res.status(200).json({
        paymentId: payment._id,
        status: payment.status,
        amount: payment.amount,
        currency: payment.currency,
    });
};

export const confirmMockPayment = async (req: Request, res: Response) => {
    const { paymentId } = req.params;

    const findResult = await fromPromise(
        Payment.findById(paymentId),
        (err) => {
            console.log("PAYMENT FIND ERROR:", err);
            return new Error("Database Error");
        }
    );

    if (findResult.isErr()) {
        return res.status(500).json({ message: findResult.error.message });
    }

    const payment = findResult.value;

    if (!payment) {
        return res.status(404).json({ message: "Payment not found" });
    }

    if (payment.status !== "pending") {
        return res.status(400).json({ message: "Payment already resolved" });
    }

    const providerImpl = getProvider(payment.provider);

    const verifyResult = await fromPromise(
        providerImpl.verifyPayment(
            payment.providerReference!,
            payment.amount.toString()
        ),
        (err) => {
            console.log("PROVIDER VERIFY ERROR:", err);
            return new Error("Provider Error");
        }
    );

    if (verifyResult.isErr()) {
        return res.status(500).json({ message: verifyResult.error.message });
    }

    const result = verifyResult.value;

    payment.status = result.status;
    payment.providerResponse = result.rawResponse;

    const saveResult = await fromPromise(
        payment.save(),
        (err) => {
            console.log("PAYMENT CONFIRM SAVE ERROR:", err);
            return new Error("Database Error");
        }
    );

    if (saveResult.isErr()) {
        return res.status(500).json({ message: saveResult.error.message });
    }

    return res.status(200).json({
        paymentId: payment._id,
        status: payment.status,
        callbackUrl: payment.callbackUrl,
    });
};

export const getEsewaForm = async (req : Request , res : Response) =>
{
    const{paymentId} = req.params;

    const findResult = await fromPromise(
        Payment.findById(paymentId),
        (err) => {
            console.log("PAYMENT FIND ERROR:", err);
            return new Error("Database Error");
        }
    );

    if (findResult.isErr()) {
        return res.status(500).json({ message: findResult.error.message });
    }

    const payment = findResult.value;

    if (!payment) {
        return res.status(404).json({ message: "Payment not found" });
    }

    if (payment.provider !== "esewa") {
        return res.status(400).json({ message: "Not an eSewa payment" });
    }

    if (payment.status !== "pending") {
        return res.status(400).json({ message: "Payment already resolved" });
    }

    const form = await esewaProvider.createPayment
    (
        payment.amount,
        payment.currency,
        payment._id.toString(),
        payment.callbackUrl
    );

    return res.json(form);
}



export const verifyEsewaCallback = async (req: Request, res: Response) => {
    const { data } = req.query;
    if (typeof data !== "string") {
        return res.status(400).json({ message: "Missing data param" });
    }

    let decoded: Record<string, string>;
    try {
        decoded = JSON.parse(Buffer.from(data, "base64").toString("utf-8"));
    } catch {
        return res.status(400).json({ message: "Invalid base64 data" });
    }

    const signedFieldNames = decoded.signed_field_names;
    if (typeof signedFieldNames !== "string" || !signedFieldNames.trim()) {
        return res.status(400).json({ message: "Missing signed field names" });
    }

    const signedFields = signedFieldNames.split(",");
    const message = signedFields.map((f) => `${f}=${decoded[f]}`).join(",");
    const expected = crypto
        .createHmac("sha256", process.env.ESEWA_SECRET_KEY!)
        .update(message)
        .digest("base64");

    if (expected !== decoded.signature) {
        return res.status(400).json({ message: "Invalid signature" });
    }

    const payment = await Payment.findById(decoded.transaction_uuid);
    if (!payment) {
        return res.status(404).json({ message: "Payment not found" });
    }

    payment.status = decoded.status === "COMPLETE" ? "success" : "failed";
    payment.providerResponse = decoded;

    await payment.save();

    return res.json({
        paymentId: payment._id,
        status: payment.status,
    });
};