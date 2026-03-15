export const getAvatarColor = (email: string): string => {
  const colors = [
    "bg-emerald-500",
    "bg-blue-500",
    "bg-violet-500",
    "bg-orange-500",
    "bg-rose-500",
    "bg-teal-500",
  ];
  const index =
    email.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) %
    colors.length;
  return colors[index];
};
