import { useCallback, useState } from "react"

type Method = "GET" | "POST" | "PUT" | "DELETE" 

export function useApi<T> ()
{
    const [ data , setData ] = useState<T | null>(null);
    const [loading , setLoading] = useState(false);
    const [ error , setError] = useState("");

    const request = useCallback( async( method : Method , path : string , body?: object) =>
    {
        setLoading(true);
        setError("");

        try 
        {
            const res = await fetch(`/api/payments${path}` , 
                { 
                    method,
                    headers: { "Content-Type" : "application/json"},
                    body : body ? JSON.stringify(body) : undefined,
                }
            )
        

        const result = await res.json();

        if(!res.ok)
        {
            throw new Error(result.message || "something went wrong")
        }

        setData(result);
        return result;
    }catch(err)
    {
        const message = err instanceof Error ? err.message : "Something went wrong"
        setError(message);
        throw err;
    }
    finally
    {
        setLoading(false);
    }
    },[]);

    return { data , loading , error , request};

}