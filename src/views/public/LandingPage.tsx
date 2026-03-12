import { useState, type FC } from "react";
import { motion } from "framer-motion";
import SearchInput from "../../components/ui/SearchInput";
import PostsCarousel from "../../components/ui/PostsCarousel";

const MOCK_POSTS = [
  {
    img: "https://picsum.photos/seed/cow1/400/550",
    title: "Novilla Brahman",
    weight: 250,
    price: 580,
  },
  {
    img: "https://picsum.photos/seed/cow2/400/550",
    title: "Toro Cebú",
    weight: 420,
    price: 1200,
  },
  {
    img: "https://picsum.photos/seed/cow3/400/550",
    title: "Novilla Brahman",
    weight: 230,
    price: 540,
  },
  {
    img: "https://picsum.photos/seed/cow4/400/550",
    title: "Ternero Angus",
    weight: 180,
    price: 390,
  },
  {
    img: "https://picsum.photos/seed/cow5/400/550",
    title: "Vaca Lechera",
    weight: 380,
    price: 950,
  },
  {
    img: "https://picsum.photos/seed/cow6/400/550",
    title: "Toro Brahman",
    weight: 510,
    price: 1450,
  },
  {
    img: "https://picsum.photos/seed/cow7/400/550",
    title: "Novilla Angus",
    weight: 270,
    price: 620,
  },
  {
    img: "https://picsum.photos/seed/cow8/400/550",
    title: "Becerro Cebú",
    weight: 150,
    price: 310,
  },
  {
    img: "https://picsum.photos/seed/cow9/400/550",
    title: "Vaca Brahman",
    weight: 360,
    price: 870,
  },
];

const LandingPage: FC = () => {
  const [search, setSearch] = useState("");

  return (
    <main className="min-h-screen flex-1 bg-background">
      {/* Hero */}
      <motion.section
        className="relative mt-8 mb-4 rounded-2xl overflow-hidden min-h-[75vh] max-w-[90vw] mx-auto"
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
          onSearch={(val) => console.log("Search:", val)}
          className="relative z-10 mt-12 w-[calc(100%-2rem)] mx-auto hidden lg:flex"
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
              className="h-80 -m-16 object-contain"
            />
            <h1 className="text-primary font-avant font-bold text-6xl tracking-widest">
              AGRODIL
            </h1>
          </div>
        </motion.div>
      </motion.section>

      {/* Posts carousel */}
      <motion.section
        className="py-6 max-w-[90vw] mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut", delay: 0.4 }}
      >
        <PostsCarousel posts={MOCK_POSTS} visibleCount={3} />
      </motion.section>
    </main>
  );
};

export default LandingPage;
