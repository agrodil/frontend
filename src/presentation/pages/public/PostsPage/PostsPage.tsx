import { useState, useEffect, type FC } from "react";
import { useLoaderData, useNavigate } from "react-router-dom";

import { motion } from "framer-motion";

import SearchInput from "@/presentation/ui/SearchInput";
import CardPost from "@/presentation/ui/CardPost";
import LocationSelects from "@/presentation/ui/LocationSelects";
import Button from "@/presentation/ui/Button";
import PostDetailModal from "@/presentation/ui/PostDetailModal/PostDetailModal";

import type { PostsPageLoaderData } from "@/presentation/router/loaders/posts.loader";

import type { PostsPost } from "@/api/interfaces/requests/PostsPost.interface";
import type { PostsSearchResult } from "@/api/interfaces/responses/PostsSearchResult.interface";
import type { LocationValue } from "@/presentation/interfaces/ui/LocationSelectsProps";

const isSearchResult = (
  item: PostsPost | PostsSearchResult,
): item is PostsSearchResult => "posted_by_name" in item;

// Toda la búsqueda vive en la URL: cambiar un filtro navega, react-router vuelve
// a correr el loader y la petición se relanza sola. Sin `q` no hay filtros que
// aplicar, así que se descartan.
const buildPostsUrl = (
  q: string,
  filters: LocationValue = { stateId: "", townshipId: "" },
): string => {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (q && filters.stateId) params.set("stateId", filters.stateId);
  if (q && filters.townshipId) params.set("townshipId", filters.townshipId);
  const qs = params.toString();
  return qs ? `/posts?${qs}` : "/posts";
};

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
  const [search, setSearch] = useState(query);
  const [items, setItems] = useState(loadedItems);
  const [postDetail, setPostDetail] = useState(loadedPostDetail);

  useEffect(() => {
    setSearch(query);
  }, [query]);

  useEffect(() => {
    setItems(loadedItems);
  }, [loadedItems]);

  useEffect(() => {
    setPostDetail(loadedPostDetail);
  }, [loadedPostDetail]);

  // Los filtros se derivan de la URL en vez de guardarse en estado local: así
  // no hay que sincronizarlos con el loader y el back/forward del navegador
  // reconstruye la búsqueda completa.
  const filters: LocationValue = { stateId, townshipId };
  const hasFilters = !!(stateId || townshipId);

  const handleSearch = (val: string) => {
    // Una búsqueda nueva conserva los filtros de ubicación ya aplicados.
    navigate(buildPostsUrl(val.trim(), filters));
  };

  const handleFiltersChange = (next: LocationValue) => {
    navigate(buildPostsUrl(query, next));
  };

  const handleCardClick = (cardId: string) => {
    const params = new URLSearchParams(
      buildPostsUrl(query, filters).split("?")[1] ?? "",
    );
    params.set("postId", cardId);
    navigate(`/posts?${params.toString()}`);
  };

  const handleModalClose = () => {
    navigate(buildPostsUrl(query, filters));
  };

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
          onSearch={handleSearch}
          className="mb-6 w-full"
        />

        {/* Los filtros solo aparecen una vez hecha la búsqueda por texto. */}
        {query && (
          <div className="mb-6 p-4 border border-gray-200 rounded-2xl shadow-sm">
            <p className="text-xs font-bold text-primary uppercase tracking-wide mb-3">
              Filtrar por ubicación
            </p>
            <LocationSelects
              value={filters}
              onChange={handleFiltersChange}
              stateLabel="Estado"
              townshipLabel="Municipio"
              emptyOptionLabel="Todos"
            />
          </div>
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
                  handleFiltersChange({ stateId: "", townshipId: "" })
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
                onClick={() => handleCardClick(card.id)}
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
          onClose={handleModalClose}
          onUpdated={(updated) => {
            setPostDetail(updated);
            setItems((prev) =>
              prev.map((item) =>
                item.livestock_post_id === updated.livestock_post_id
                  ? {
                      ...item,
                      livestock_post_name: updated.livestock_post_name,
                      sale_type_id: updated.sale_type_id,
                      avg_weight_kg: updated.avg_weight_kg,
                      price_per_kg: updated.price_per_kg,
                      price_per_unit: updated.price_per_unit,
                    }
                  : item,
              ),
            );
          }}
          onDeactivated={(deactivatedId) => {
            setItems((prev) =>
              prev.filter((item) => item.livestock_post_id !== deactivatedId),
            );
            setPostDetail(null);
          }}
        />
      )}
    </main>
  );
};

export default PostsPage;
