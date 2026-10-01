import type { paymentProviderName } from "../models/payments.js";

export const mockProvider = {

    async createPayment(_amount: number, _currency: string, paymentId: string , callbackUrl : string)
    {
        const providerReference = `mock_${paymentId}_${Date.now()}`;
        const redirectUrl = `http://localhost:5174/mock-pay/${paymentId}`;

        return { providerReference , redirectUrl };
    },

    async verifyPayment(providerReference: string , _totalAmount : string)
    {
      return {
        status: "success" as const,
        rawResponse: {
          mock: true as const,
          providerReference,
          verifiedAt: Date.now()
        },
      };
    },
}