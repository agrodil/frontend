import { landingApi, type LandingPost } from "@/api/clients/landing.api";
import { catalogApi, type CattlePriceAverage } from "@/api/clients/catalog.api";
import { resolvePostPricing } from "@/shared/utils/resolvePostPricing";
import type { CardPostProps } from "@/presentation/interfaces/ui/CardPostProps";

export type LandingPageLoaderData = {
  posts: CardPostProps[];
  cattlePriceAverages: CattlePriceAverage[];
};

export const getLandingData = async (): Promise<LandingPageLoaderData> => {
  const [landingPosts, cattlePriceAverages]: [
    LandingPost[],
    CattlePriceAverage[],
  ] = await Promise.all([
    landingApi.getLandingPage(),
    // Data secundaria: si falla, la landing igual se renderiza sin la fila de
    // promedios en vez de caer al ErrorBoundary.
    catalogApi.getCattlePriceAverages().catch((error: unknown) => {
      console.error("No se pudieron cargar los promedios de precio:", error);
      return [];
    }),
  ]);

  const posts: CardPostProps[] = landingPosts.map((post) => {
    const pricing = resolvePostPricing(post);
    return {
      id: post.post_id,
      img: post.main_image_url,
      title: post.post_name,
      priceLabel: pricing.priceLabel,
      priceSuffix: pricing.priceSuffix,
      price: pricing.price,
      owner: post.owner_name,
      townshipId: post.township_id,
    };
  });

  return { posts, cattlePriceAverages };
};
