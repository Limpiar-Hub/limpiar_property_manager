"use client";

import { useState, useEffect, useCallback } from "react";
import { Sidebar } from "@/components/sidebar";
import { Search, Plus, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";

import { AddPropertyModal } from "@/components/property/add-property-modal";
import { toast } from "@/components/ui/use-toast";
import {
  fetchProperties,
  fetchPropertyById,
  verifyPropertyCreation,
  deleteProperty,
  updateProperty,
} from "@/services/api";
import { PropertyDetailsModal } from "@/components/property/property-details-modal";

interface Property {
  _id: string;
  name: string;
  address: string;
  type: string;
  subType: string;
  size: string;
  propertyManagerId: string;
  status: "pending" | "verified";
  images: string[];
  createdAt: string;
  updatedAt: string;
  managerId?: string;
}

export default function Support() {
  return (
    <div className="flex   min-h-screen bg-white">
      <Sidebar />
      <div className=" text-lg bg-green-600 ml-60 justify-center align-center flex-1 p-8">
        <h2> welcome to support Page</h2>
      </div>
    </div>
  );
}
