export type CreatePaymentResult =
    | {
          providerReference: string;
          redirectUrl: string;
      }
    | {
          providerReference: string;
          formAction: string;
          formFields: Record<string, string>;
      };

export interface VerifyPaymentResult {
    status: "pending" | "success" | "failed";
    rawResponse: Record<string, unknown>;
}

export interface paymentProvider {
    createPayment(
        amount: number,
        currency: string,
        paymentId: string,
        callbackUrl: string
    ): Promise<CreatePaymentResult>;

    verifyPayment(
        providerReference: string,
        totalAmount: string
    ): Promise<VerifyPaymentResult>;
}