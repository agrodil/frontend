import { landingApi, type LandingPost } from "@/api/clients/landing.api";
import { resolvePostPricing } from "@/shared/utils/resolvePostPricing";
import type { CardPostProps } from "@/presentation/interfaces/ui/CardPostProps";

export type LandingPageLoaderData = {
  posts: CardPostProps[];
};

export const getLandingData = async (): Promise<LandingPageLoaderData> => {
  const landingPosts: LandingPost[] = await landingApi.getLandingPage();

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

  return { posts };
};
