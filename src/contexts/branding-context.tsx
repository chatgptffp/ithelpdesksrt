"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

interface Branding {
  id?: string;
  code?: string;
  name: string;
  logoUrl: string | null;
  faviconUrl: string | null;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  email?: string | null;
  phone?: string | null;
  website?: string | null;
}

interface BrandingContextType {
  branding: Branding;
  isLoading: boolean;
  refreshBranding: () => Promise<void>;
}

const defaultBranding: Branding = {
  name: "IT Helpdesk",
  logoUrl: null,
  faviconUrl: null,
  primaryColor: "#3b82f6",
  secondaryColor: "#64748b",
  accentColor: "#f59e0b",
};

const BrandingContext = createContext<BrandingContextType>({
  branding: defaultBranding,
  isLoading: true,
  refreshBranding: async () => {},
});

export function BrandingProvider({ children }: { children: ReactNode }) {
  const [branding, setBranding] = useState<Branding>(defaultBranding);
  const [isLoading, setIsLoading] = useState(true);

  const fetchBranding = async () => {
    try {
      const response = await fetch("/api/branding");
      if (response.ok) {
        const data = await response.json();
        setBranding(data);
        
        // Apply CSS variables for colors
        document.documentElement.style.setProperty("--primary-color", data.primaryColor);
        document.documentElement.style.setProperty("--secondary-color", data.secondaryColor);
        document.documentElement.style.setProperty("--accent-color", data.accentColor);
        
        // Update favicon if provided
        if (data.faviconUrl) {
          const link = document.querySelector("link[rel='icon']") as HTMLLinkElement;
          if (link) {
            link.href = data.faviconUrl;
          }
        }
        
        // Update page title
        if (data.name) {
          document.title = data.name;
        }
      }
    } catch (error) {
      console.error("Error fetching branding:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBranding();
  }, []);

  const refreshBranding = async () => {
    setIsLoading(true);
    await fetchBranding();
  };

  return (
    <BrandingContext.Provider value={{ branding, isLoading, refreshBranding }}>
      {children}
    </BrandingContext.Provider>
  );
}

export function useBranding() {
  const context = useContext(BrandingContext);
  if (!context) {
    throw new Error("useBranding must be used within a BrandingProvider");
  }
  return context;
}
