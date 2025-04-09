import {
  Building2,
  ShoppingBag,
  Warehouse,
  Hotel,
  Stethoscope,
  Building,
  GraduationCap,
  Train,
  Wheat,
} from "lucide-react"

export const categories = [
  {
    id: "office",
    icon: Building2,
    title: "Office",
    description: "Corporate & Administrative",
    subcategories: [
      {
        id: "corporate-hq",
        title: "Corporate Headquarters",
        description: "Large office building / Single company's HQ",
      },
      {
        id: "skyscraper",
        title: "Skyscrapers / High-Rise Offices",
        description: "Multi-floor buildings with different businesses",
      },
      {
        id: "business-park",
        title: "Business Parks / Office Parks",
        description: "Clusters of mid-rise office buildings",
      },
      {
        id: "low-rise",
        title: "Low-Rise / Single-Tenant Offices",
        description: "Smaller office buildings for specific companies",
      },
      {
        id: "coworking",
        title: "Co-Working Spaces",
        description: "Shared workspaces for freelancers and startups",
      },
      {
        id: "government",
        title: "Government & Municipal Offices",
        description: "Administrative centers for public service",
      },
    ],
  },
  {
    id: "retail",
    icon: ShoppingBag,
    title: "Retail",
    description: "Shopping & Consumer Goods",
    subcategories: [
      {
        id: "shopping-mall",
        title: "Shopping Malls",
        description: "Large indoor shopping centers with multiple retailers",
      },
      {
        id: "strip-mall",
        title: "Strip Malls",
        description: "Row of stores with front parking",
      },
      {
        id: "standalone",
        title: "Standalone Retail",
        description: "Individual retail buildings",
      },
      {
        id: "outlet",
        title: "Outlet Centers",
        description: "Collection of manufacturer outlet stores",
      },
      {
        id: "market",
        title: "Markets & Food Halls",
        description: "Indoor/outdoor markets and food venues",
      },
    ],
  },
  {
    id: "industrial",
    icon: Warehouse,
    title: "Industrial",
    description: "Production & Logistics",
    subcategories: [
      {
        id: "warehouse",
        title: "Warehouses",
        description: "Storage and distribution facilities",
      },
      {
        id: "manufacturing",
        title: "Manufacturing Plants",
        description: "Production and assembly facilities",
      },
      {
        id: "logistics",
        title: "Logistics Centers",
        description: "Transportation and distribution hubs",
      },
      {
        id: "flex-space",
        title: "Flex Space",
        description: "Combined warehouse and office space",
      },
      {
        id: "data-center",
        title: "Data Centers",
        description: "Facilities for computer systems and storage",
      },
    ],
  },
  {
    id: "hospitality",
    icon: Hotel,
    title: "Hospitality",
    description: "Lodging & Dining",
    subcategories: [
      {
        id: "hotel",
        title: "Hotels",
        description: "Full-service accommodation facilities",
      },
      {
        id: "motel",
        title: "Motels",
        description: "Roadside accommodation facilities",
      },
      {
        id: "resort",
        title: "Resorts",
        description: "Vacation and leisure properties",
      },
      {
        id: "restaurant",
        title: "Restaurants",
        description: "Dining establishments",
      },
      {
        id: "bar",
        title: "Bars & Nightclubs",
        description: "Entertainment venues",
      },
    ],
  },
  {
    id: "healthcare",
    icon: Stethoscope,
    title: "Healthcare",
    description: "Medical & Wellness",
    subcategories: [
      {
        id: "hospital",
        title: "Hospitals",
        description: "Full-service medical facilities",
      },
      {
        id: "medical-office",
        title: "Medical Offices",
        description: "Doctor's offices and clinics",
      },
      {
        id: "urgent-care",
        title: "Urgent Care Centers",
        description: "Walk-in medical facilities",
      },
      {
        id: "senior-living",
        title: "Senior Living Facilities",
        description: "Retirement homes and assisted living",
      },
      {
        id: "wellness",
        title: "Wellness Centers",
        description: "Fitness and health facilities",
      },
    ],
  },
  {
    id: "mixed-use",
    icon: Building,
    title: "Mixed-Use",
    description: "Multi-Purpose Developments",
    subcategories: [
      {
        id: "residential-retail",
        title: "Residential & Retail",
        description: "Combined living and shopping spaces",
      },
      {
        id: "office-retail",
        title: "Office & Retail",
        description: "Combined working and shopping spaces",
      },
      {
        id: "live-work",
        title: "Live-Work Spaces",
        description: "Combined living and working spaces",
      },
      {
        id: "mixed-complex",
        title: "Mixed Complexes",
        description: "Multiple use types in one development",
      },
    ],
  },
  {
    id: "educational",
    icon: GraduationCap,
    title: "Educational",
    description: "Learning & Public Services",
    subcategories: [
      {
        id: "university",
        title: "University Buildings",
        description: "Higher education facilities",
      },
      {
        id: "school",
        title: "Schools",
        description: "K-12 educational facilities",
      },
      {
        id: "training-center",
        title: "Training Centers",
        description: "Professional development facilities",
      },
      {
        id: "daycare",
        title: "Daycare Centers",
        description: "Child care facilities",
      },
      {
        id: "library",
        title: "Libraries",
        description: "Public and private libraries",
      },
    ],
  },
  {
    id: "transportation",
    icon: Train,
    title: "Transportation",
    description: "Transit & Infrastructure",
    subcategories: [
      {
        id: "airport",
        title: "Airport Facilities",
        description: "Aviation-related buildings",
      },
      {
        id: "train-station",
        title: "Train Stations",
        description: "Railway facilities",
      },
      {
        id: "bus-terminal",
        title: "Bus Terminals",
        description: "Bus transportation hubs",
      },
      {
        id: "parking",
        title: "Parking Structures",
        description: "Multi-level parking facilities",
      },
    ],
  },
  {
    id: "agricultural",
    icon: Wheat,
    title: "Agricultural",
    description: "Farming & Agriculture",
    subcategories: [
      {
        id: "farm",
        title: "Farm Buildings",
        description: "Agricultural production facilities",
      },
      {
        id: "greenhouse",
        title: "Greenhouses",
        description: "Controlled environment growing facilities",
      },
      {
        id: "storage",
        title: "Storage Facilities",
        description: "Agricultural product storage",
      },
      {
        id: "processing",
        title: "Processing Facilities",
        description: "Agricultural product processing",
      },
    ],
  },
]

