import { ProductDTO } from "./product.model"; // Assuming product.model.ts contains ProductDTO

export interface OrderItemDTO {
  id?: number;
  productDetails: ProductDTO;
  quantity: number;
  price: number; // Represents BigDecimal from backend
}

export interface OrderDTO {
  id?: number;
  customerId: number;
  orderDate: string; // LocalDateTime from backend, string in TS
  status: string; // String representation of OrderStatus enum
  totalAmount: number; // Represents BigDecimal from backend
  orderItems: OrderItemDTO[];
  shippingAddress: string; // Changed from 'string' to 'number' to match backend DTO, and made optional
 // If you need full address details, you'd define an AddressDTO and use that.

  
  couponCode?: string; // Optional, as a coupon might not always be applied
  discountAmount?: number; // Optional, represents BigDecimal from backend
}
