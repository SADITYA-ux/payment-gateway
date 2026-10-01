import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useApi } from "../hooks/useApi";
import type { PaymentStatusResponse } from "../types/payment";

interface EsewaCallbackData {
    transaction_code: string;
    status: string;
    total_amount: string;
    transaction_uuid: string;
    product_code: string;
    signed_field_names: string;
    signature: string;
}

export default function CallbackTest() {
    const [params] = useSearchParams();
    const dataParam = params.get("data");
    const mockPaymentId = params.get("paymentId");
    const mockStatus = params.get("status");

    const [esewa, setEsewa] = useState<EsewaCallbackData | null>(null);
    const [decodeError, setDecodeError] = useState("");
    const statusApi = useApi<PaymentStatusResponse>();

 useEffect(() => {
        if (!dataParam) return;
        try {
            const decoded = JSON.parse(atob(dataParam)) as EsewaCallbackData;
            setEsewa(decoded);
        } catch {
            setDecodeError("Could not decode eSewa response");
        }
    }, [dataParam]);

    useEffect(() => {
        if (dataParam) {
            statusApi
                .request("GET", `/esewa/verify?data=${encodeURIComponent(dataParam)}`)
                .catch(() => {
                    // statusApi.error is set by the hook
                });
        } else if (mockPaymentId) {
            statusApi.request("GET", `/${mockPaymentId}/status`);
        }
    }, [dataParam, mockPaymentId]);


    const paymentId = esewa?.transaction_uuid ?? mockPaymentId;
    const urlStatus = esewa?.status?.toLowerCase() ?? mockStatus;
    const verifiedStatus = statusApi.loading
        ? "checking…"
        : statusApi.data?.status ?? "could not verify";

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
            <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
                <h1 className="text-xl font-bold text-slate-900">Returned to calling app</h1>

                {decodeError && (
                    <p className="mt-4 rounded bg-red-50 px-3 py-2 text-sm text-red-600">{decodeError}</p>
                )}

                <dl className="mt-6 space-y-3 text-sm">
                    <div className="flex justify-between gap-4">
                        <dt className="text-gray-500">Payment ID</dt>
                        <dd className="font-mono text-slate-900">{paymentId ?? "—"}</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                        <dt className="text-gray-500">Status from redirect</dt>
                        <dd className="font-semibold text-slate-900">{urlStatus ?? "—"}</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                        <dt className="text-gray-500">Verified with gateway</dt>
                        <dd className="font-semibold text-slate-900">{verifiedStatus}</dd>
                    </div>
                </dl>

                {esewa && (
                    <p className="mt-4 text-xs text-gray-500">
                        eSewa ref: <span className="font-mono">{esewa.transaction_code}</span>
                    </p>
                )}

                {statusApi.error && (
                    <p className="mt-6 rounded bg-red-50 px-3 py-2 text-sm text-red-600">
                        {statusApi.error}
                    </p>
                )}
            </div>
        </div>
    );
}