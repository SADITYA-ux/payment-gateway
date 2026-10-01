import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useApi } from "../hooks/useApi";

interface EsewaForm {
    providerReference: string;
    formAction: string;
    formFields: Record<string, string>;
}

export default function EsewaRedirect() {
    const { paymentId } = useParams();
    const api = useApi<EsewaForm>();

    useEffect(() => {
        if (paymentId) {
            api.request("GET", `/${paymentId}/esewa-form`);
        }
    }, [paymentId]);

    useEffect(() => {
        if (api.data) {
            const form = document.getElementById("esewa-form") as HTMLFormElement | null;
            form?.submit();
        }
    }, [api.data]);

    if (api.error) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
                <div className="w-full max-w-sm rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm">
                    <p className="text-sm font-semibold text-red-600">Could not redirect to eSewa</p>
                    <p className="mt-2 text-sm text-gray-600">{api.error}</p>
                </div>
            </div>
        );
    }

    if (api.loading || !api.data) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50">
                <p className="text-sm text-gray-500">Redirecting to eSewa…</p>
            </div>
        );
    }

    return (
        <form id="esewa-form" action={api.data.formAction} method="POST">
            {Object.entries(api.data.formFields).map(([name, value]) => (
                <input key={name} type="hidden" name={name} value={value} />
            ))}
            <noscript>
                <button type="submit">Continue to eSewa</button>
            </noscript>
        </form>
    );
}