// src/app/models/discount-models.ts

export interface DiscountDTO {
  id?: number;
  code: string;
  type: 'PERCENTAGE' | 'FIXED_AMOUNT';
  value: number;
  minOrderAmount?: number;
  startDate: string; // ISO date string
  endDate: string; // ISO date string
  usageLimit?: number;
  usedCount?: number;
  active: boolean; // Renamed from 'isActive' to 'active' as per your provided DiscountDTO
}
