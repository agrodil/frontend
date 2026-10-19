export type UpdatePostPayload = Partial<{
  postCategoryId: number;
  postName: string;
  postSubcategoryId: number;
  predominantBreed: string;
  livestockSectorId: number;
  saleTypeId: number;
  sex: string;
  quantity: number;
  avgWeightKg: number;
  pricePerKg: number;
  priceWeightBasis: string;
  pricePerUnit: number;
  postBrand: string;
  farmHectares: number;
  pricePerHectare: number;
  townshipId: number;
  details: string;
}>;
