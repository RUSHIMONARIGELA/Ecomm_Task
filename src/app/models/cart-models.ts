import { ProductDTO } from "./product.model";

    export interface CartItemDTO {
      id?: number; 
      productId?: number; 
      productDetails: ProductDTO; 
      quantity: number;
      price: number;
    }

    export interface CartDTO {
      id?: number;
      customerId: number;
      cartItems: CartItemDTO[];
      totalPrice: number;
    }
    