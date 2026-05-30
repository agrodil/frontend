export function formatPhone(raw: string): string {
  let phone = raw.replace(/[\s-]/g, "");
  if (phone.startsWith("+58")) phone = phone.slice(3);
  else if (phone.startsWith("0058")) phone = phone.slice(4);
  else if (phone.startsWith("58") && phone.length === 12)
    phone = phone.slice(2);
  if (phone.startsWith("0")) phone = phone.slice(1);
  return phone;
}
