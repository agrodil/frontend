export interface LocationValue {
  stateId: string;
  townshipId: string;
}

export interface LocationFieldsProps {
  value: LocationValue;
  onChange: (value: LocationValue) => void;
  error?: string | null;
}
