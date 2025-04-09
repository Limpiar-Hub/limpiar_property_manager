import Image from "next/image"
import { CheckEmailForm } from "@/components/auth/check-email-form"

export default function CheckEmailPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-[400px] mx-auto space-y-8">
        <div className="flex justify-center">
          <Image src="/logo.jpg" alt="Limpiar Logo" width={165} height={48} priority />
        </div>
        <CheckEmailForm />
      </div>
    </main>
  )
}

