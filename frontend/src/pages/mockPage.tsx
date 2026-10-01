import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useApi } from "../hooks/useApi"
import type { PaymentStatusResponse, ConformMockResponce } from "../types/payment";

export default function MockPay() {
    const { paymentId } = useParams();
    const statusApi = useApi<PaymentStatusResponse>();
    const confirmApi = useApi<ConformMockResponce>();
    const [initialLoad, setInitialLoad] = useState(true);

    useEffect(() => {
        statusApi.request("GET", `/${paymentId}/status`).finally(() => setInitialLoad(false));
    }, [paymentId]);

    async function handleConfirm() {
        try {
            const result = await confirmApi.request("POST", `/${paymentId}/confirm-mock`);
            const target = new URL(result.callbackUrl);
            target.searchParams.set("paymentId", result.paymentId);
            target.searchParams.set("status", result.status);
            window.location.href = target.toString();
        } catch {
        }
    }

    const payment = statusApi.data;

    if (initialLoad) return <p className="p-10 text-center text-gray-500">Loading...</p>;
    if (!payment) return <p className="p-10 text-center text-red-600">{statusApi.error || "Payment not found"}</p>;
    if (payment.status !== "pending") return <p className="p-10 text-center text-gray-700">This payment is already {payment.status}.</p>;

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
            <div className="w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wider text-amber-600">
                    Mock gateway (test mode)
                </p>
                <h1 className="mt-2 text-xl font-bold text-slate-900">Confirm payment</h1>
                <p className="mt-6 text-3xl font-bold text-slate-900">
                    {payment.currency} {payment.amount}
                </p>

                {confirmApi.error && (
                    <p className="mt-4 rounded bg-red-50 px-3 py-2 text-sm text-red-600">{confirmApi.error}</p>
                )}

                <button
                    onClick={handleConfirm}
                    disabled={confirmApi.loading}
                    className="mt-8 w-full rounded-lg bg-amber-400 py-3 text-sm font-bold text-black hover:bg-amber-500 disabled:opacity-60"
                >
                    {confirmApi.loading ? "Processing..." : "Confirm payment"}
                </button>
            </div>
        </div>
    );
}