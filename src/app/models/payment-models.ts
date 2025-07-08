
export interface PaymentDTO {
 id?: number;
  paymentMethod: string; 
  amount: number; 
  orderId?: number; 
  paymentDate?: string; 
  status?: string; 
}
