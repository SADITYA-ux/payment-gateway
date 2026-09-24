import type { paymentProviderName } from "../models/payments.js";
import { mockProvider } from "./mock.js";
import type { paymentProvider } from "./types.js";


const providers: Record<paymentProviderName, paymentProvider> = {
    mock: mockProvider as unknown as paymentProvider,
    esewa: mockProvider as unknown as paymentProvider,
    stripe: mockProvider as unknown as paymentProvider
};

export const getProvider = (name: paymentProviderName): paymentProvider =>
    providers[name];