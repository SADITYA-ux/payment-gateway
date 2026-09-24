import type { paymentProviderName } from "../models/payments.js";

export const mockProvider = {

    async createPayment(_amount: number, _currency: string, paymentId: string)
    {
        const providerReference = `mock_${paymentId}_${Date.now()}`;
        const redirectUrl = `http://localhost:5173/pay/mock/${paymentId}`;

        return { providerReference , redirectUrl };
    },

    async verifyPayment(providerReference: any)
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