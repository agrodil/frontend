const MOCK_POSTS = [
  {
    img: "https://picsum.photos/seed/cow1/400/550",
    title: "Novilla Brahman",
    saleTypeId:250,
    price: 580,
    owner: "Juan Pérez",
  },
  {
    img: "https://picsum.photos/seed/cow2/400/550",
    title: "Toro Cebú",
    saleTypeId:420,
    price: 1200,
    owner: "María Gómez",
  },
  {
    img: "https://picsum.photos/seed/cow3/400/550",
    title: "Novilla Brahman",
    saleTypeId:230,
    price: 540,
    owner: "Carlos Rodríguez",
  },
  {
    img: "https://picsum.photos/seed/cow4/400/550",
    title: "Ternero Angus",
    saleTypeId:180,
    price: 390,
    owner: "Ana Martínez",
  },
  {
    img: "https://picsum.photos/seed/cow5/400/550",
    title: "Vaca Lechera",
    saleTypeId:380,
    price: 950,
    owner: "Luis Fernández",
  },
  {
    img: "https://picsum.photos/seed/cow6/400/550",
    title: "Toro Brahman",
    saleTypeId:510,
    price: 1450,
    owner: "Sofía López",
  },
  {
    img: "https://picsum.photos/seed/cow7/400/550",
    title: "Novilla Angus",
    saleTypeId:270,
    price: 620,
    owner: "Agropecuaria El Campo S.A.",
  },
  {
    img: "https://picsum.photos/seed/cow8/400/550",
    title: "Becerro Cebú",
    saleTypeId:150,
    price: 310,
    owner: "Granja Los Pinos",
  },
  {
    img: "https://picsum.photos/seed/cow9/400/550",
    title: "Vaca Brahman",
    saleTypeId:360,
    price: 870,
    owner: "Distribuidora Mayor de Alimentos del Zulia",
  },
];

export type LandingPageLoaderData = {
  posts: typeof MOCK_POSTS;
};

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const getLandingData = async (): Promise<LandingPageLoaderData> => {
  // TODO: reemplazar con fetch real al backend (imágenes y datos de la landing)
  await wait(1000);

  return { posts: MOCK_POSTS };
};
