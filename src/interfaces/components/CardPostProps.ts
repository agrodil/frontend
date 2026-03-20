export interface CardPostProps {
  img?: string | null;
  title: string;
  saleTypeId: number;
  price: number;
  owner: string;
  onClick?: () => void;
}
