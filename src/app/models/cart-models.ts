    // src/app/models/cart-models.ts (or product.model.ts)

import { ProductDTO } from "./product.model";

  

    export interface CartItemDTO {
      id?: number;
      // If your backend CartItemDTO has a productId field, keep it.
      // Otherwise, you can remove it and rely solely on productDetails.id
      productId?: number; // Keep if backend CartItemDTO explicitly has this.
      productDetails: ProductDTO; // This is the crucial part
      quantity: number;
      price: number;
    }

    export interface CartDTO {
      id?: number;
      customerId: number;
      cartItems: CartItemDTO[];
      totalPrice: number;
    }
    