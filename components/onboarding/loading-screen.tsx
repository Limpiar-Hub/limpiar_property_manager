import Image from "next/image"

export function LoadingScreen() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <Image src="/logo.jpg" alt="Limpiar Logo" width={90} height={90} priority />
      <p className="mt-4 text-[#6B7280]">Loading your account...</p>
    </div>
  )
}

