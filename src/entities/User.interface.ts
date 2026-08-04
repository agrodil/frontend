export interface User {
  // IDs
  id: string; // alias for app_user_id
  app_user_id?: string;
  person_id?: string;
  role: number; // alias for role_id
  roleId?: number;
  role_id?: number;
  reputationLevelId?: number;
  reputation_level_id?: number;
  townshipId?: number;
  township_id?: number;

  // Personal Information
  firstName?: string;
  first_name?: string;
  middleName?: string;
  middle_name?: string;
  lastName?: string;
  surname?: string;
  secondLastName?: string;
  second_surname?: string;
  companyName?: string;
  company_name?: string;
  birthdate?: string;

  // Contact
  email: string;
  phone: string;

  // Document
  documentType?: string; // 'V' | 'J'
  document_type?: string;
  documentNumber?: string | number;
  document_number?: string | number;

  // Account Status
  isVerified?: boolean;
  is_verified?: boolean;

  // Timestamps
  createdAt?: string;
  created_at?: string;
  updatedAt?: string;
  updated_at?: string;
}
