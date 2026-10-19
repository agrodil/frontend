import type { User } from "@/adapters/contexts/AuthProps";

export const fullName = (user: User) => {
  const firstName = user.firstName ?? "";
  const lastName = user.lastName ?? "";
  return user.documentType === "V"
    ? `${firstName} ${lastName}`.trim() || user.email
    : user.companyName || user.email;
};
