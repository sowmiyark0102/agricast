import React, { createContext, useContext, useState, useEffect } from "react";
import { Panchayat, CropProfile, Activity } from "../types";
import { useAuth } from "./AuthContext";

interface FarmSelectionValue {
  panchayat: Panchayat | null;
  setPanchayat: (p: Panchayat) => void;
  crop: CropProfile | null;
  setCrop: (c: CropProfile) => void;
  cropStage: string;
  setCropStage: (s: string) => void;
  activity: Activity;
  setActivity: (a: Activity) => void;
}

const FarmSelectionContext = createContext<FarmSelectionValue | undefined>(undefined);

/**
 * Keeps District -> Block -> Panchayat -> Crop -> Crop Stage -> Weather selection
 * consistent across every farmer-facing page in the connected demo journey.
 */
export function FarmSelectionProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [panchayat, setPanchayat] = useState<Panchayat | null>(null);
  const [crop, setCrop] = useState<CropProfile | null>(null);
  const [cropStage, setCropStage] = useState<string>(user?.cropStage || "Vegetative");
  const [activity, setActivity] = useState<Activity>("SOWING");

  useEffect(() => {
    if (user?.cropStage) setCropStage(user.cropStage);
  }, [user]);

  return (
    <FarmSelectionContext.Provider
      value={{ panchayat, setPanchayat, crop, setCrop, cropStage, setCropStage, activity, setActivity }}
    >
      {children}
    </FarmSelectionContext.Provider>
  );
}

export function useFarmSelection() {
  const ctx = useContext(FarmSelectionContext);
  if (!ctx) throw new Error("useFarmSelection must be used within FarmSelectionProvider");
  return ctx;
}
