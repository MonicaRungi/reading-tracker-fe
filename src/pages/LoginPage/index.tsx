import { useState, type FormEvent } from "react"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/useAuth"

export default function LoginPage() {
  const { t } = useTranslation()
  const { signInWithMagicLink, signInWithGoogle } = useAuth()
  const [email, setEmail] = useState("")
  const [isSending, setIsSending] = useState(false)

  async function handleMagicLink(event: FormEvent) {
    event.preventDefault()
    setIsSending(true)
    try {
      await signInWithMagicLink(email)
      toast.success(t("auth.magicLinkSent"))
    } catch {
      toast.error(t("common.error"))
    } finally {
      setIsSending(false)
    }
  }

  async function handleGoogle() {
    try {
      await signInWithGoogle()
    } catch {
      toast.error(t("common.error"))
    }
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-8 bg-accent px-6">
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-foreground">{t("auth.title")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("auth.subtitle")}</p>
      </div>

      <form onSubmit={handleMagicLink} className="w-full max-w-sm space-y-3">
        <div className="space-y-1">
          <label htmlFor="email" className="text-sm font-medium text-foreground">
            {t("auth.emailLabel")}
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder={t("auth.emailPlaceholder")}
            className="w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm text-foreground placeholder:text-hint focus:outline-none"
          />
        </div>
        <Button type="submit" disabled={isSending} className="w-full">
          {t("auth.sendMagicLink")}
        </Button>
      </form>

      <Button type="button" variant="outline" onClick={handleGoogle} className="w-full max-w-sm">
        {t("auth.continueWithGoogle")}
      </Button>
    </div>
  )
}
