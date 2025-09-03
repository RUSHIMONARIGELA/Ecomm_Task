
export interface DiscountDTO {
  id?: number;
  code: string;
  type: 'PERCENTAGE' | 'FIXED_AMOUNT';
  value: number;
  minOrderAmount?: number;
  startDate: string; 
  endDate: string; 
  usageLimit?: number;
  usedCount?: number;
  active: boolean; 
}
