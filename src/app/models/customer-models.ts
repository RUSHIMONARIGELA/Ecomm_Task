export interface UserDetailsDTO {
  id?: number;
  username: string;
  password?: string; 
  email: string;
  phoneNumber?: string; 
  active?: boolean; 
  createdAt?: string; 
  updatedAt?: string; 
  roles?: string[];
}

export interface CustomerDTO {
  id?: number;
  userDetails: UserDetailsDTO;
  profileDetails?: ProfileDTO;
}

export interface AddressDTO {
  id?: number;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  type?: string;
}

export interface ProfileDTO {
  id?: number;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  addresses: AddressDTO[];
  customerId?: number; 
}
