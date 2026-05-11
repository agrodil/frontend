import { useEffect, useState, type FC } from "react";
import { useLoaderData, useNavigate } from "react-router-dom";

import { motion } from "framer-motion";

import SearchInput from "@/components/ui/SearchInput";
import PostsCarousel from "@/components/ui/PostsCarousel";
import PostDetailModal from "@/components/ui/PostDetailModal/PostDetailModal";

import type { PostDetail } from "@/interfaces/api/posts/PostDetail.interface";

import type { LandingPageLoaderData } from "@/routes/loaders/landing.loader";

import { postApi } from "@/services/api/posts.api";

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
          className="relative my-8 lg:my-2 rounded-2xl overflow-hidden min-h-[60vh] max-w-[90vw] mx-auto"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
        >
          <div className="hero-bg absolute inset-0" />
          <div className="absolute inset-0 bg-background/40" />

          <SearchInput
            placeholder="Buscar"
            value={search}
            onChange={setSearch}
            onSearch={(val) => {
              if (val.trim())
                navigate(`/posts?q=${encodeURIComponent(val.trim())}`);
            }}
            className="relative z-10 mt-12 w-1/2 mx-auto hidden lg:flex"
          />

          {/* Centered logo */}
          <motion.div
            className="relative z-10 flex items-center justify-center h-full py-16"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.3 }}
          >
            <div className="flex flex-col items-center max-lg:mx-auto max-lg:w-fit">
              {" "}
              <img
                src="/AGRODIL ENTREGA_ICONO PINCIPAL  PNG.png"
                alt="Agrodil logo"
                className="h-96 -m-16 object-contain"
              />
              <h1 className="text-primary font-avant font-bold text-5xl md:text-6xl tracking-widest">
                AGRODIL
              </h1>
            </div>
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
                  p.id === updated.livestock_post_id
                    ? {
                        ...p,
                        title: updated.livestock_post_name,
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
