"use client";

import * as React from "react";
import { Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLanguage } from "@/lib/i18n";

export function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl">
          <Languages className="h-4 w-4" />
          <span className="sr-only">Toggle language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="rounded-xl min-w-[120px]">
        <DropdownMenuItem 
          onClick={() => setLanguage("th")} 
          className={`rounded-lg cursor-pointer ${language === "th" ? "bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400" : ""}`}
        >
          <span className="mr-2">🇹🇭</span>
          ไทย
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setLanguage("en")} 
          className={`rounded-lg cursor-pointer ${language === "en" ? "bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400" : ""}`}
        >
          <span className="mr-2">🇺🇸</span>
          English
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
