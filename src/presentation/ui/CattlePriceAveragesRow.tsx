import type { FC } from "react";
import type { CattlePriceAverage } from "@/api/clients/catalog.api";

interface CattlePriceAveragesRowProps {
  averages: CattlePriceAverage[];
}

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
          <p className="text-2xl md:text-4xl font-bold text-primary">
            ${Number(average.avg_kg_price).toFixed(2)}
            <span className="text-sm font-normal"> / kg</span>
          </p>
        </div>
      ))}
    </div>
  );
};

export default CattlePriceAveragesRow;
