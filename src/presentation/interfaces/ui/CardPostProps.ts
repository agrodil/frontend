export interface CardPostProps {
  id?: string;
  img?: string | null;
  title: string;
  /** Subtítulo bajo el título — resuelto por resolvePostPricing (p.ej. "Por Kilo"). */
  priceLabel?: string | null;
  /** Sufijo junto al precio — resuelto por resolvePostPricing (p.ej. "/ hectárea"). */
  priceSuffix?: string | null;
  townshipId?: number | null;
  price: number;
  owner: string;
  onClick?: () => void;
}
