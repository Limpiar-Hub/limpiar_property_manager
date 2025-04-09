import { redirect } from "next/navigation"
import { ROUTES } from "@/lib/constants"

export default function HomePage() {
  // Redirect to login page from the root
  redirect(ROUTES.LOGIN)
}

