export type UpdatePostPayload = Partial<{
  postCategoryId: number;
  postName: string;
  postSubcategoryName: string;
  livestockSectorId: number;
  saleTypeId: number;
  sex: string;
  quantity: number;
  avgWeightKg: number;
  pricePerKg: number;
  pricePerUnit: number;
  postBrand: string;
  farmHectares: number;
  pricePerHectare: number;
  townshipId: number;
  details: string;
}>;
