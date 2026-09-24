export interface createPaymentResult
{
    providerRefrence : string;
    redirectURL : string;
}

export interface verifyPaymentResult
{
    status : "success" | "failed";
    rawResponse : Record<string , unknown>;
}

export interface paymentProvider
{
    createpayment(
        amount : Number,
        currency : string,
        paymentId : string
    ) : Promise<createPaymentResult>

    verifyPayment(
        providerRefrence : string
    ) : Promise<verifyPaymentResult>
};

