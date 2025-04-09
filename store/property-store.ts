import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface PropertyImage {
  id: string
  url: string
  file: File
}

interface PropertyDetails {
  floors: number
  units: number
  officeRooms: number
  meetingRooms: number
  lobbies: number
  restrooms: number
  breakRooms: number
  cafeteria: number
  gym: number
}

export interface SavedProperty {
  id: string
  name: string
  location: string
  category: string
  subcategory: string
  details: PropertyDetails
  images: { id: string; url: string }[]
  status: "active" | "pending"
  createdAt: string
}

interface PropertyData {
  name: string
  location: string
  category: string
  subcategory: string
  details: PropertyDetails
  images: PropertyImage[]
}

interface PropertyStore {
  property: PropertyData
  savedProperties: SavedProperty[]
  setPropertyName: (name: string) => void
  setPropertyLocation: (location: string) => void
  setPropertyCategory: (category: string) => void
  setPropertySubcategory: (subcategory: string) => void
  setPropertyDetails: (details: PropertyDetails) => void
  setPropertyImages: (images: PropertyImage[]) => void
  saveProperty: () => void
  reset: () => void
}

const initialState: PropertyData = {
  name: "",
  location: "",
  category: "",
  subcategory: "",
  details: {
    floors: 1,
    units: 1,
    officeRooms: 1,
    meetingRooms: 1,
    lobbies: 1,
    restrooms: 1,
    breakRooms: 1,
    cafeteria: 1,
    gym: 1,
  },
  images: [],
}

export const usePropertyStore = create<PropertyStore>()(
  persist(
    (set, get) => ({
      property: initialState,
      savedProperties: [],
      setPropertyName: (name) =>
        set((state) => ({
          property: { ...state.property, name },
        })),
      setPropertyLocation: (location) =>
        set((state) => ({
          property: { ...state.property, location },
        })),
      setPropertyCategory: (category) =>
        set((state) => ({
          property: { ...state.property, category },
        })),
      setPropertySubcategory: (subcategory) =>
        set((state) => ({
          property: { ...state.property, subcategory },
        })),
      setPropertyDetails: (details) =>
        set((state) => ({
          property: { ...state.property, details },
        })),
      setPropertyImages: (images) =>
        set((state) => ({
          property: { ...state.property, images },
        })),
      saveProperty: () => {
        const currentProperty = get().property
        const newProperty: SavedProperty = {
          id: Math.random().toString(36).substr(2, 9),
          name: currentProperty.name,
          location: currentProperty.location,
          category: currentProperty.category,
          subcategory: currentProperty.subcategory,
          details: currentProperty.details,
          images: currentProperty.images.map((img) => ({ id: img.id, url: img.url })),
          status: "active",
          createdAt: new Date().toISOString(),
        }
        set((state) => ({
          savedProperties: [...state.savedProperties, newProperty],
          property: initialState,
        }))
      },
      reset: () => set({ property: initialState }),
    }),
    {
      name: "property-storage",
    },
  ),
)

