import type { User } from "../interfaces/auth/AuthProps";

export function mapUser(raw: Record<string, unknown>): User {
  return {
    id: raw.app_user_id as string,
    email: raw.email as string,
    role: raw.role_id as number,
    firstName: (raw.first_name as string) ?? undefined,
    middleName: (raw.middle_name as string) ?? undefined,
    lastName: (raw.surname as string) ?? undefined,
    secondLastName: (raw.second_surname as string) ?? undefined,
    documentType: (raw.document_type as string) ?? undefined,
    documentNumber:
      raw.document_number != null ? String(raw.document_number) : undefined,
    townshipId: raw.township_id != null ? Number(raw.township_id) : undefined,
    municipality: raw.township_id != null ? String(raw.township_id) : undefined,
    phone: (raw.phone as string) ?? undefined,
  };
}
