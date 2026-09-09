import { useEffect, useState, type FC } from "react";
import { useLoaderData, useNavigate } from "react-router-dom";

import { motion } from "framer-motion";

import SearchInput from "@/presentation/ui/SearchInput";
import PostsCarousel from "@/presentation/ui/PostsCarousel";
import PostDetailModal from "@/presentation/ui/PostDetailModal/PostDetailModal";

import type { PostDetail } from "@/api/interfaces/responses/PostDetail.interface";

import type { LandingPageLoaderData } from "@/presentation/router/loaders/landing.loader";

import { postApi } from "@/api/clients/posts.api";

import logo from "@/presentation/assets/images/AGRODIL ENTREGA_LOGO VARIANTE DE COLOR 2 PNG.png";

const LandingPage: FC = () => {
  const [search, setSearch] = useState("");
  const [postDetail, setPostDetail] = useState<PostDetail | null>(null);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [, setLoading] = useState(false);
  const navigate = useNavigate();
  const { posts: loadedPosts } = useLoaderData() as LandingPageLoaderData;
  const [posts, setPosts] = useState(loadedPosts);

  useEffect(() => {
    setPosts(loadedPosts);
  }, [loadedPosts]);

  const handleCardClick = async (postId: string) => {
    setLoading(true);
    try {
      const detail = await postApi.getPostById(postId);
      setPostDetail(detail);
      setSelectedPostId(postId);
    } catch (error) {
      console.error("Error loading post detail:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleModalClose = () => {
    setPostDetail(null);
    setSelectedPostId(null);
  };

  const selectedCard = selectedPostId
    ? posts.find((p) => p.id === selectedPostId)
    : null;

  return (
    <>
      <main className="min-h-screen flex-1 bg-background">
        {/* Hero */}
        <motion.section
          className="relative my-8 lg:my-2 rounded-2xl overflow-hidden max-w-[90vw] mx-auto
            flex flex-col items-center
            px-4 pt-10 pb-12 lg:pt-12
            min-h-[22rem] lg:min-h-[26rem]"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
        >
          <div className="hero-bg absolute inset-0" />
          <div className="absolute inset-0 bg-gray-800/60" />

          <SearchInput
            placeholder="Buscar"
            value={search}
            onChange={setSearch}
            onSearch={(val) => {
              if (val.trim())
                navigate(`/posts?q=${encodeURIComponent(val.trim())}`);
            }}
            className="relative z-10 w-1/2 mx-auto hidden lg:flex
              transition-all duration-300
              !bg-white/10 !border-white/20 backdrop-blur-md
              [&_svg]:text-white/80 [&_svg]:transition-colors [&_svg]:duration-300
              [&_input]:text-white [&_input]:placeholder-white/70 [&_input]:transition-colors [&_input]:duration-300
              hover:!bg-white hover:!border-gray-300 hover:backdrop-blur-none
              hover:[&_svg]:text-gray-400
              hover:[&_input]:text-gray-700 hover:[&_input]:placeholder-gray-400
              focus-within:!bg-white focus-within:!border-gray-300 focus-within:backdrop-blur-none
              focus-within:[&_svg]:text-gray-400
              focus-within:[&_input]:text-gray-700 focus-within:[&_input]:placeholder-gray-400"
          />

          {/*
            Logo: se sitúa siempre debajo del search input (hijos apilados en
            flex-col). El PNG entregado tiene un borde transparente grande, así
            que el <img> se renderiza sobredimensionado (~1.7x) y este contenedor
            lo recorta con overflow-hidden.

            REDIMENSIONAR = cambiar solo `--logo-h` (alto visible del logo).
            El wrapper toma ese alto y el <img> se escala solo con el calc().
            No toques el multiplicador 1.7 salvo que el recorte deje de calzar
            con el arte visible del PNG.
          */}
          <motion.div
            className="relative z-10 mt-8 lg:mt-10 overflow-hidden
              flex items-center justify-center
              [--logo-h:12rem] md:[--logo-h:14rem] lg:[--logo-h:18rem]
              h-[var(--logo-h)]"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.3 }}
          >
            <img
              src={logo}
              alt="Agrodil logo"
              className="h-[calc(var(--logo-h)*1.7)] w-auto max-w-none object-contain"
            />
          </motion.div>
        </motion.section>

        {/* Posts carousel */}
        <motion.section
          className="py-0 max-w-[90vw] mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.4 }}
        >
          <h2 className="text-primary my-4 font-avant font-bold text-lg md:text-4xl">
            Publicaciones recientes
          </h2>
          <p></p>
          <PostsCarousel
            posts={posts}
            visibleCount={3}
            onCardClick={handleCardClick}
          />
        </motion.section>

        {postDetail && selectedCard && (
          <PostDetailModal
            post={postDetail}
            previewImg={selectedCard.img || null}
            previewOwner={selectedCard.owner}
            onClose={handleModalClose}
            onUpdated={(updated) => {
              setPostDetail(updated);
              setPosts((prev) =>
                prev.map((p) =>
                  p.id === updated.post_id
                    ? {
                        ...p,
                        title: updated.post_name,
                        saleTypeId: updated.sale_type_id,
                        price:
                          Number(
                            updated.sale_type_id === 1
                              ? updated.price_per_kg
                              : updated.price_per_unit,
                          ) || 0,
                      }
                    : p,
                ),
              );
            }}
            onDeactivated={(deactivatedId) => {
              setPosts((prev) => prev.filter((p) => p.id !== deactivatedId));
              setPostDetail(null);
              setSelectedPostId(null);
            }}
          />
        )}
      </main>
    </>
  );
};

export default LandingPage;
