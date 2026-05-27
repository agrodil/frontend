import { usersApi } from "@/services/api/users.api";

export const checkEmailExistsAction = async (
  email: string,
): Promise<boolean> => {
  const data = await usersApi.checkEmail(email);
  return data.exists;
};

export const checkPhoneExistsAction = async (
  phone: string,
): Promise<boolean> => {
  const data = await usersApi.checkPhone(phone);
  return data.exists;
};

export const checkDocumentExistsAction = async (
  document: string,
): Promise<boolean> => {
  const data = await usersApi.checkDocument(document);
  return data.exists;
};

export const updateUserProfileAction = async (
  data: Record<string, string | File | File[] | boolean>,
) => {
  return await usersApi.update(data);
};
