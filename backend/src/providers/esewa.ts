import crypto from "crypto";

const PRODUCT_CODE = process.env.ESEWA_PRODUCT_CODE!;
const SECRET = process.env.ESEWA_SECRET_KEY!;
const FORM_URL = process.env.ESEWA_BASE_URL!;
const STATUS_URL = process.env.ESEWA_STATUS_URL!;

function sign(totalAmount: string, transactionUuid: string, productCode: string) {
    const message = `total_amount=${totalAmount},transaction_uuid=${transactionUuid},product_code=${productCode}`;
    return crypto.createHmac("sha256", SECRET).update(message).digest("base64");
}

export const esewaProvider = {
    async createPayment(amount: number, currency: string, paymentId: string, callbackUrl: string) {
        if (currency !== "NPR") {
            throw new Error("eSewa only supports NPR");
        }

        const totalAmount = amount.toString();
        const transactionUuid = paymentId;
        const signature = sign(totalAmount, transactionUuid, PRODUCT_CODE);

        return {
            providerReference: transactionUuid,
            formAction: FORM_URL,
            formFields: {
                amount: totalAmount,
                tax_amount: "0",
                product_service_charge: "0",
                product_delivery_charge: "0",
                total_amount: totalAmount,
                transaction_uuid: transactionUuid,
                product_code: PRODUCT_CODE,
                success_url: callbackUrl,
                failure_url: callbackUrl,
                signed_field_names: "total_amount,transaction_uuid,product_code",
                signature,
            },
        };
    },

    async verifyPayment(reference: string, totalAmount: string) {
        const url = `${STATUS_URL}?product_code=${PRODUCT_CODE}&total_amount=${totalAmount}&transaction_uuid=${reference}`;
        const res = await fetch(url);
        const data = await res.json();

        return {
            status:
                data.status === "COMPLETE" ? "success" :
                data.status === "PENDING"  ? "pending" :
                                             "failed",
            rawResponse: data,
        };
    },
};