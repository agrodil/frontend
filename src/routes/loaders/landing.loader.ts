import { landingApi, type LandingPost } from "../../services/api/landing.api";
import type { CardPostProps } from "../../interfaces/components/ui/CardPostProps";

export type LandingPageLoaderData = {
  posts: CardPostProps[];
};

export const getLandingData = async (): Promise<LandingPageLoaderData> => {
  const landingPosts: LandingPost[] = await landingApi.getLandingPage();

  const posts: CardPostProps[] = landingPosts.map((post) => ({
    id: post.livestock_post_id,
    img: post.main_image_url,
    title: post.livestock_post_name,
    saleTypeId: post.sale_type_id,
    price: Number(post.price_per_kg ?? post.price_per_unit ?? 0),
    owner: post.owner_name,
  }));

  return { posts };
};
