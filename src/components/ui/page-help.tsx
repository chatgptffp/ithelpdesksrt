"use client";

import { useState } from "react";
import { HelpCircle, X, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface HelpItem {
  title: string;
  description: string;
}

interface PageHelpProps {
  title?: string;
  items: HelpItem[];
  defaultOpen?: boolean;
}

export function PageHelp({ title = "วิธีใช้งาน", items, defaultOpen = false }: PageHelpProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  if (items.length === 0) return null;

  return (
    <div className="mb-6">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="gap-2 text-blue-600 border-blue-200 hover:bg-blue-50 dark:border-blue-800 dark:hover:bg-blue-900/20"
      >
        <HelpCircle className="h-4 w-4" />
        {title}
        {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </Button>

      {isOpen && (
        <Card className="mt-3 bg-blue-50/50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800">
          <CardContent className="p-4">
            <div className="flex justify-between items-start mb-3">
              <h4 className="font-medium text-blue-900 dark:text-blue-100 flex items-center gap-2">
                <HelpCircle className="h-4 w-4" />
                {title}
              </h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="h-6 w-6 p-0 text-blue-600 hover:text-blue-800"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <ul className="space-y-2">
              {items.map((item, index) => (
                <li key={index} className="text-sm">
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {item.title}:
                  </span>{" "}
                  <span className="text-gray-600 dark:text-gray-400">
                    {item.description}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
