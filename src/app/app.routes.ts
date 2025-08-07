import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { SignupComponent } from './pages/signup/signup.component';
import { HomeComponent } from './pages/customer/home/home.component';
import { authGuard } from './guard/auth.guard'; // Ensure this path is correct
import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';
import { AdminProductFormComponent } from './pages/Admin/products/admin-product-form/admin-product-form.component';
import { AdminProductListComponent } from './pages/Admin/products/admin-product-list/admin-product-list.component';
import { DashboardComponent } from './pages/Admin/dashboard/dashboard.component';
import { ProfileComponent } from './pages/customer/profile/profile.component';

import { CustomerLayoutComponent } from './layouts/customer-layout/customer-layout.component';
import { OrderListComponent } from './pages/Admin/order-list/order-list.component';
import { CustomerListComponent } from './pages/Admin/customer-list/customer-list.component';

import { CartComponent } from './pages/customer/cart/cart.component';
import { OrdersComponent } from './pages/customer/orders/orders.component';
import { PaymentComponent } from './pages/customer/payment/payment.component';

import { CustomerproductsComponent } from './pages/customer/customerproducts/customerproducts.component';
import { PublicProductsListComponent } from './layouts/public-products-list/public-products-list.component';
import { OrderDetailComponent } from './pages/Admin/order-detail/order-detail.component';
import { CustomerDetailComponent } from './pages/Admin/customer-detail/customer-detail.component';
import { AdminCategoryComponent } from './pages/Admin/admin-category/admin-category.component';
import { AdminProductBulkUploadComponent } from './pages/Admin/admin-product-bulk-upload/admin-product-bulk-upload.component';
import { DiscountListComponent } from './pages/Admin/discount-list/discount-list.component';
import { DiscountFormComponent } from './pages/Admin/discount-form/discount-form.component';
import { UserManagementComponent } from './pages/Admin/user-management/user-management.component'; // Keep this import

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
    
    data: { expectedRole: 'ADMIN' }, // 'SUPER_ADMIN' will also be allowed due to role hierarchy in authGuard
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
      { path: 'categories', component: AdminCategoryComponent },
      { path: 'discounts', component: DiscountListComponent },
      { path: 'discounts/new', component: DiscountFormComponent },
      { path: 'discounts/edit/:id', component: DiscountFormComponent },
      { path: 'user-management', component: UserManagementComponent }
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
