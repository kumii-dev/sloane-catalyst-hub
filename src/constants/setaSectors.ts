export const SETA_SECTORS = [
  "Agriculture",
  "Banking",
  "Chemical Industries",
  "Construction",
  "Education, Training and Development",
  "Energy",
  "Fibre, Processing and Manufacturing",
  "Finance and Accounting Services",
  "Food and Beverages",
  "Forestry and Wood",
  "Health and Welfare",
  "Information and Communication Technology",
  "Insurance",
  "Local Government",
  "Manufacturing, Engineering and Related Services",
  "Media, Advertising, Publishing, Printing and Packaging",
  "Mining and Minerals",
  "Plastics",
  "Police, Public and Private Security",
  "Public Service",
  "Services",
  "Tourism and Hospitality",
  "Transport",
  "Wholesale and Retail"
] as const;

export type SETASector = typeof SETA_SECTORS[number];
