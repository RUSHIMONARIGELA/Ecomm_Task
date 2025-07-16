import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component'; // Assuming path: /pages/login
import { SignupComponent } from './pages/signup/signup.component'; // Assuming path: /pages/signup
import { HomeComponent } from './pages/customer/home/home.component'; // This is likely the Customer Dashboard/Products page
import { authGuard } from './guard/auth.guard'; // Corrected from './guards/auth.guard' in previous turns
import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';
import { AdminProductFormComponent } from './pages/Admin/products/admin-product-form/admin-product-form.component';
import { AdminProductListComponent } from './pages/Admin/products/admin-product-list/admin-product-list.component';

import { DashboardComponent } from './pages/Admin/dashboard/dashboard.component'; // Admin Dashboard
import { ProfileComponent } from './pages/customer/profile/profile.component'; // Customer Profile

import { CustomerLayoutComponent } from './layouts/customer-layout/customer-layout.component'; // Public/Unauthenticated Layout

import { OrderListComponent } from './pages/Admin/order-list/order-list.component'; // Admin Order List
import { CustomerListComponent } from './pages/Admin/customer-list/customer-list.component'; // Admin Customer List

import { CartComponent } from './pages/customer/cart/cart.component'; // Customer Cart
import { OrdersComponent } from './pages/customer/orders/orders.component'; // Customer Orders List/Detail
import { PaymentComponent } from './pages/customer/payment/payment.component'; // Customer Payment

import { CustomerproductsComponent } from './pages/customer/customerproducts/customerproducts.component'; // Customer Product List (Authenticated)
import { PublicProductsListComponent } from './layouts/public-products-list/public-products-list.component'; // Public Product List (Unauthenticated)
import { OrderDetailComponent } from './pages/Admin/order-detail/order-detail.component';
import { CustomerDetailComponent } from './pages/Admin/customer-detail/customer-detail.component';
import { AdminCategoryComponent } from './pages/Admin/admin-category/admin-category.component';
import { AdminProductBulkUploadComponent } from './pages/Admin/admin-product-bulk-upload/admin-product-bulk-upload.component';

export const routes: Routes = [
  
  {
    path: '', 
    component: CustomerLayoutComponent, 
    children: [
      { path: '', redirectTo: 'products-list', pathMatch: 'full' },
      { path: 'products-list', component: PublicProductsListComponent },
      
    ],
  },

  
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },

  {
    path: 'admin',
    component: AdminLayoutComponent, 
    canActivate: [authGuard],
    data: { expectedRole: 'ADMIN' },
    children: [
      { path: '', component: DashboardComponent }, 
      { path: 'products', component: AdminProductListComponent },
      { path: 'products/create', component: AdminProductFormComponent },
      { path: 'products/edit/:id', component: AdminProductFormComponent },
      { path: 'products/bulk-upload', component: AdminProductBulkUploadComponent },
      { path: 'orders', component: OrderListComponent },
      { path: 'orders/edit/:id', component: OrderDetailComponent },
      { path: 'customers', component: CustomerListComponent },
      { path: 'customers/edit/:id', component: CustomerDetailComponent },
      { path: 'categories', component: AdminCategoryComponent } 
    ],
  },

  
  {
    path: 'home', 
    component: HomeComponent, 
    canActivate: [authGuard],
    data: { expectedRole: 'CUSTOMER' }, 
    children: [
      { path: '', component: CustomerproductsComponent }, 
      { path: 'cart', component: CartComponent },
      { path: 'orders', component: OrdersComponent }, 
      { path: 'orders/:orderId', component: OrdersComponent }, 
      { path: 'profile', component: ProfileComponent }, 
      { path: 'checkout/:orderId', component: PaymentComponent }, 
    ],
  },

  
  { path: '**', redirectTo: 'products-list' },
];
