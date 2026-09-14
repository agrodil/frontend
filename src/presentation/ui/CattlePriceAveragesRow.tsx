import type { FC } from "react";
import type { CattlePriceAverage } from "@/api/clients/catalog.api";

interface CattlePriceAveragesRowProps {
  averages: CattlePriceAverage[];
}

// null o 0 = sin precio de referencia cargado todavía para esa base — no se
// muestra (evita un "$0.00 / kg" engañoso).
const hasPrice = (value: string | null): boolean =>
  value !== null && Number(value) > 0;

const CattlePriceAveragesRow: FC<CattlePriceAveragesRowProps> = ({
  averages,
}) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {averages.map((average) => (
        <div
          key={average.post_subcategory_id}
          className="border border-gray-300 rounded-xl bg-white backdrop-blur-md p-2"
        >
          <p className="text-md md:text-lg font-avant font-bold text-accent">
            {average.post_subcategory_name}
          </p>
          {hasPrice(average.avg_price_per_kg_live) && (
            <p className="text-2xl md:text-4xl font-bold text-primary">
              ${Number(average.avg_price_per_kg_live).toFixed(2)}
              <span className="text-sm font-normal"> / kg en pie</span>
            </p>
          )}
          {hasPrice(average.avg_price_per_kg_carcass) && (
            <p className="text-xl md:text-2xl font-bold text-primary/80">
              ${Number(average.avg_price_per_kg_carcass).toFixed(2)}
              <span className="text-sm font-normal"> / kg en canal</span>
            </p>
          )}
        </div>
      ))}
    </div>
  );
};

export default CattlePriceAveragesRow;
