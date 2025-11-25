import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(value: number, decimals: number = 0): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

export function formatBoldText(text: string): string {
  // First, handle bold text
  let formatted = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  
  // Then, convert asterisk bullet points to numbered lists
  const lines = formatted.split('\n');
  let inList = false;
  let listCounter = 0;
  
  const processedLines = lines.map((line, index) => {
    const trimmedLine = line.trim();
    
    // Check if line starts with asterisk (bullet point)
    if (trimmedLine.startsWith('*')) {
      if (!inList) {
        inList = true;
        listCounter = 0;
      }
      listCounter++;
      // Remove the asterisk and replace with number
      return line.replace(/^\s*\*\s*/, `${listCounter}. `);
    } else {
      if (inList && trimmedLine !== '') {
        inList = false;
        listCounter = 0;
      }
      return line;
    }
  });
  
  return processedLines.join('\n');
}
