import { type FC } from "react";
import { useLoaderData, useNavigate } from "react-router-dom";

import { motion } from "framer-motion";

import SearchInput from "@/presentation/ui/SearchInput";
import CardPost from "@/presentation/ui/CardPost";
import Button from "@/presentation/ui/Button";
import PostDetailModal from "@/presentation/ui/PostDetailModal/PostDetailModal";
import LocationFilterPanel from "./LocationFilterPanel";
import { useSyncedState } from "@/adapters/hooks/common/useSyncedState";

import type { PostsPageLoaderData } from "@/presentation/router/loaders/posts.loader";

import type { PostsPost } from "@/api/interfaces/requests/PostsPost.interface";
import type { PostsSearchResult } from "@/api/interfaces/responses/PostsSearchResult.interface";
import type { LocationValue } from "@/presentation/interfaces/ui/LocationSelectsProps";

import {
  handleSearch,
  handleFiltersChange,
  handleCardClick,
  handleModalClose,
  handlePostUpdated,
  handlePostDeactivated,
} from "./PostsPage.handlers";

const isSearchResult = (
  item: PostsPost | PostsSearchResult,
): item is PostsSearchResult => "posted_by_name" in item;

const PostsPage: FC = () => {
  const {
    items: loadedItems,
    query,
    stateId,
    townshipId,
    postDetail: loadedPostDetail,
    postId,
  } = useLoaderData() as PostsPageLoaderData;
  const navigate = useNavigate();
  const [items, setItems] =
    useSyncedState<(PostsPost | PostsSearchResult)[]>(loadedItems);
  const [postDetail, setPostDetail] = useSyncedState(loadedPostDetail);
  const [search, setSearch] = useSyncedState(query);

  const filters: LocationValue = { stateId, townshipId };
  const hasFilters = !!(stateId || townshipId);

  const cards = items.map((item) => ({
    id: item.livestock_post_id,
    img: item.main_image_url ?? null,
    title: item.livestock_post_name,
    saleTypeId: Number(item.sale_type_id),
    price:
      Number(
        item.sale_type_id === 1 ? item.price_per_kg : item.price_per_unit,
      ) || 0,
    owner: isSearchResult(item) ? item.posted_by_name : item.posted_by,
    townshipId: item.township_id,
  }));

  const selectedCard = postId
    ? (cards.find((c) => c.id === postId) ?? null)
    : null;

  return (
    <main className="w-[90vw] mx-auto mt-8 mb-16">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-primary font-avant font-bold text-2xl md:text-4xl mb-6">
          Publicaciones
        </h1>

        <SearchInput
          placeholder="Buscar ganado..."
          value={search}
          onChange={setSearch}
          onSearch={(val) => handleSearch(navigate, filters, val)}
          className="mb-6 w-full hidden lg:block"
        />

        {query && (
          <LocationFilterPanel
            value={filters}
            onChange={(next) => handleFiltersChange(navigate, query, next)}
          />
        )}

        {query && (
          <p className="text-sm text-gray-500 mb-6">
            {items.length} resultado{items.length !== 1 ? "s " : " "} para
            &quot;
            {query}&quot;
          </p>
        )}

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-gray-400 gap-3">
            <p className="text-lg font-semibold">
              No se encontraron publicaciones
            </p>
            {hasFilters ? (
              <Button
                label="Limpiar filtros"
                variant="secondary"
                size="sm"
                onClick={() =>
                  handleFiltersChange(navigate, query, {
                    stateId: "",
                    townshipId: "",
                  })
                }
              />
            ) : (
              query && (
                <button
                  type="button"
                  onClick={() => navigate("/posts")}
                  className="text-sm text-primary underline cursor-pointer"
                >
                  Ver todas las publicaciones
                </button>
              )
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {cards.map((card) => (
              <CardPost
                key={card.id}
                img={card.img}
                title={card.title}
                saleTypeId={card.saleTypeId}
                townshipId={card.townshipId}
                price={card.price}
                owner={card.owner}
                onClick={() =>
                  handleCardClick(navigate, query, filters, card.id)
                }
              />
            ))}
          </div>
        )}
      </motion.div>

      {postDetail && selectedCard && (
        <PostDetailModal
          post={postDetail}
          previewImg={selectedCard.img}
          previewOwner={selectedCard.owner}
          onClose={() => handleModalClose(navigate, query, filters)}
          onUpdated={(updated) =>
            handlePostUpdated(setPostDetail, setItems, updated)
          }
          onDeactivated={(deactivatedId) =>
            handlePostDeactivated(setItems, setPostDetail, deactivatedId)
          }
        />
      )}
    </main>
  );
};

export default PostsPage;
