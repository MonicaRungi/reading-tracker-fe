import { useEffect, useState } from "react"
import { Navigate } from "react-router-dom"
import { supabase } from "@/lib/supabase"
import { LoadingSpinner } from "@/components/shared/LoadingSpinner"

export default function AuthCallbackPage() {
  const [status, setStatus] = useState<"pending" | "done" | "error">("pending")

  useEffect(() => {
    supabase.auth
      .exchangeCodeForSession(window.location.href)
      .then(({ error }) => setStatus(error ? "error" : "done"))
  }, [])

  if (status === "pending") {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  return <Navigate to={status === "done" ? "/library" : "/login"} replace />
}
