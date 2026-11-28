export interface UserSummaryDto {
  userId: string;
  fullName: string;
  email: string;
  phone?: string;
  role: 'Admin' | 'Customer';
}

export interface UpdateCustomerProfileRequest {
  fullName: string;
  phone: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

export interface RegisterCustomerRequest {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  tokenType: 'Bearer';
  expiresAtUtc: string;
  user: UserSummaryDto;
}