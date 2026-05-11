export type UpdatePostPayload = Partial<{
  livestockTypeId: number;
  livestockPostName: string;
  breedName: string;
  sectorId: number;
  saleTypeId: number;
  sex: string;
  quantity: number;
  avgWeightKg: number;
  pricePerKg: number;
  pricePerUnit: number;
  townshipId: number;
  details: string;
}>;
