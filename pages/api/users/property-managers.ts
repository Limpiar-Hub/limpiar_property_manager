import type { NextApiRequest, NextApiResponse } from "next"
import type { User } from "@/models/User"

// Mock authentication middleware
const authenticateToken = (req: NextApiRequest, res: NextApiResponse, next: () => void) => {
  const authHeader = req.headers["authorization"]
  const token = authHeader && authHeader.split(" ")[1]

  if (token == null) return res.status(401).json({ error: "Unauthorized" })

  // For now, we'll just check if the token exists
  // In a real application, you'd verify the token here
  next()
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    try {
      await new Promise((resolve) => authenticateToken(req, res, resolve))

      // Mock data for property managers
      const propertyManagers: User[] = [
        {
          _id: "67b4467266e2baea6ddab5d4",
          fullName: "Orizu Michael",
          email: "michael@limpiar.online",
          phoneNumber: "+2347080772205",
          role: "property_manager",
          isVerified: true,
          assignedProperties: [],
          availability: true,
          onboardingChecklist: false,
          tasks: [],
          createdAt: "2025-02-18T08:36:02.902Z",
          updatedAt: "2025-02-18T08:36:45.466Z",
        },
      ]

      res.status(200).json(propertyManagers)
    } catch (error) {
      res.status(500).json({ error: "Internal Server Error" })
    }
  } else {
    res.setHeader("Allow", ["GET"])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}

