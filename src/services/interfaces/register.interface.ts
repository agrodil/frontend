export interface Register {
  email: string;
  password: string;
  phone: string;
  document_type: string;
  document_number: number;
  township_id?: number;
  first_name?: string;
  middle_name?: string;
  surname?: string;
  second_surname?: string;
}
