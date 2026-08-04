export interface CardPostProps {
  id?: string;
  img?: string | null;
  title: string;
  saleTypeId: number;
  townshipId?: number | null;
  price: number;
  owner: string;
  onClick?: () => void;
}
