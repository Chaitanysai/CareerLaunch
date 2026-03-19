export interface IndianCity {
  id: string;
  name: string;
  state: string;
  tier: 1 | 2;
  jobsCount: number;
  avgSalaryLPA: number;
  topSectors: string[];
}

export const INDIAN_CITIES: IndianCity[] = [
  { id: "bengaluru", name: "Bengaluru", state: "Karnataka", tier: 1, jobsCount: 48200, avgSalaryLPA: 18, topSectors: ["IT", "Startup", "Fintech"] },
  { id: "mumbai", name: "Mumbai", state: "Maharashtra", tier: 1, jobsCount: 38500, avgSalaryLPA: 17, topSectors: ["Finance", "Media", "IT"] },
  { id: "delhi-ncr", name: "Delhi NCR", state: "Delhi", tier: 1, jobsCount: 35000, avgSalaryLPA: 16, topSectors: ["IT", "Consulting", "Govt"] },
  { id: "hyderabad", name: "Hyderabad", state: "Telangana", tier: 1, jobsCount: 32000, avgSalaryLPA: 16, topSectors: ["IT", "Pharma", "Fintech"] },
  { id: "pune", name: "Pune", state: "Maharashtra", tier: 1, jobsCount: 24000, avgSalaryLPA: 15, topSectors: ["IT", "Auto", "Manufacturing"] },
  { id: "chennai", name: "Chennai", state: "Tamil Nadu", tier: 1, jobsCount: 22000, avgSalaryLPA: 14, topSectors: ["IT", "Auto", "Hardware"] },
  { id: "kolkata", name: "Kolkata", state: "West Bengal", tier: 1, jobsCount: 12000, avgSalaryLPA: 12, topSectors: ["IT", "Finance", "FMCG"] },
  { id: "ahmedabad", name: "Ahmedabad", state: "Gujarat", tier: 1, jobsCount: 10000, avgSalaryLPA: 11, topSectors: ["Pharma", "Textile", "IT"] },
  { id: "jaipur", name: "Jaipur", state: "Rajasthan", tier: 1, jobsCount: 7500, avgSalaryLPA: 10, topSectors: ["IT", "Tourism", "Gems"] },
  { id: "surat", name: "Surat", state: "Gujarat", tier: 1, jobsCount: 6000, avgSalaryLPA: 9, topSectors: ["Diamond", "Textile", "Finance"] },
  { id: "lucknow", name: "Lucknow", state: "Uttar Pradesh", tier: 1, jobsCount: 6500, avgSalaryLPA: 9, topSectors: ["IT", "Govt", "Retail"] },
  { id: "kochi", name: "Kochi", state: "Kerala", tier: 1, jobsCount: 8000, avgSalaryLPA: 11, topSectors: ["IT", "Shipping", "Tourism"] },
  { id: "indore", name: "Indore", state: "Madhya Pradesh", tier: 1, jobsCount: 5500, avgSalaryLPA: 9, topSectors: ["IT", "Finance", "Auto"] },
  { id: "chandigarh", name: "Chandigarh", state: "Punjab", tier: 1, jobsCount: 5000, avgSalaryLPA: 10, topSectors: ["IT", "Govt", "Education"] },
  { id: "nagpur", name: "Nagpur", state: "Maharashtra", tier: 1, jobsCount: 4500, avgSalaryLPA: 9, topSectors: ["IT", "Orange", "Logistics"] },
  { id: "bhopal", name: "Bhopal", state: "Madhya Pradesh", tier: 1, jobsCount: 4000, avgSalaryLPA: 8, topSectors: ["IT", "Govt", "Education"] },
  { id: "visakhapatnam", name: "Visakhapatnam", state: "Andhra Pradesh", tier: 1, jobsCount: 5500, avgSalaryLPA: 10, topSectors: ["IT", "Steel", "Port"] },
  { id: "coimbatore", name: "Coimbatore", state: "Tamil Nadu", tier: 1, jobsCount: 6000, avgSalaryLPA: 10, topSectors: ["Manufacturing", "IT", "Textile"] },
  { id: "remote", name: "Remote / PAN India", state: "India", tier: 1, jobsCount: 55000, avgSalaryLPA: 18, topSectors: ["IT", "Product", "Startup"] },
];

export const DEFAULT_CITY = INDIAN_CITIES[0]; // Bengaluru

export const formatSalary = (minLPA: number, maxLPA: number) =>
  `₹${minLPA}L – ₹${maxLPA}L`;
