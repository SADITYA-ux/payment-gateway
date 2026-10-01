export type paymentStatus = "pending" | "success" | "failed" | "refunded";

export interface PaymentStatusResponse
{
    paymentId : string;
    status : paymentStatus;
    amount : number;
    currency : string
}

export interface ConformMockResponce
{
    paymentId : string;
    status : paymentStatus;
    callBackUrl : string;
}