 
export interface RazorpayOrderRequestDTO {
  amount: number; 
  currency: string; 
  receipt: string;
  internalOrderId: number; 
}

export interface RazorpayOrderResponseDTO {
  id: string; 
  entity: string; 
  amount: number; 
  currency: string;
  receipt: string;
  status: string; 
  attempts: number;
  createdAt: number; 
}

export interface RazorpayPaymentCaptureRequestDTO {
  razorpayPaymentId: string;
  razorpayOrderId: string;
  razorpaySignature: string;
  amount: number;
  internalOrderId: number;
}
