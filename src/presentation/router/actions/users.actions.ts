import { usersApi } from "@/api/clients/users.api";

export const checkEmailExistsAction = async (
  email: string,
): Promise<boolean> => {
  const data = await usersApi.checkEmail(email);
  return data.exists;
};

export const updateUserProfileAction = async (
  data: Record<string, string | File | File[] | boolean>,
) => {
  return await usersApi.update(data);
};
