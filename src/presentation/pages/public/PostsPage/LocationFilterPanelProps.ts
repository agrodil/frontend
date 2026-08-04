import type { LocationValue } from "@/presentation/interfaces/ui/LocationSelectsProps";

export interface LocationFilterPanelProps {
  value: LocationValue;
  onChange: (next: LocationValue) => void;
}
