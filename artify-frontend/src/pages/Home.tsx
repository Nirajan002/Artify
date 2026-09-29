import { Link } from "react-router-dom";
import { useGetHomeDataQuery } from "../features/artworks/artworksApi";
import ArtworkCarouselSection from "../components/ArtworkCarouselSection";
import CategoryStrip from "../components/CategoryStrip";
import TestimonialStrip from "../components/TestimonialStrip";

const STEPS = [
  { title: "Browse or upload", body: "Explore original art and prints, or upload your own image to turn into a print." },
  { title: "Customize", body: "Pick a size, material and frame — or choose a ready-made variant of an artwork." },
  { title: "We print & ship", body: "Your order is prepared with care and shipped to your door." },
  { title: "Enjoy your art", body: "Hang it, gift it, and leave a review once it arrives." },
];

export default function Home() {
  const { data, isLoading, isError, refetch } = useGetHomeDataQuery();
  const home = data?.data;

  return (
    <main>
      {/* ── Hero ── */}
      <section className="hero--home">
        <h1>Art You Love.<br />Prints You Create.</h1>
        <p>Discover unique artwork or turn your own creation into a beautiful physical print.</p>
        <div className="hero__actions">
          <Link to="/shop" className="button">Explore Art</Link>
          <Link to="/custom-print" className="button button--outline">Print Your Art</Link>
        </div>
      </section>

      {isError && (
        <div className="page" style={{ textAlign: "center" }}>
          <p className="muted">Some sections couldn't load. <button onClick={refetch} style={{ marginLeft: "0.5rem" }}>Try again</button></p>
        </div>
      )}

      {isLoading ? (
        <div className="page" style={{ textAlign: "center" }}>
          <p className="muted">Loading the gallery…</p>
        </div>
      ) : home && (
        <>
          <ArtworkCarouselSection title="Featured Artwork" subtitle="Highly rated pieces from our collection" artworks={home.featured} viewAllHref="/shop?sort=rating" />
          <CategoryStrip categories={home.categories} />
          <ArtworkCarouselSection title="Popular Artwork" subtitle="What other collectors are loving" artworks={home.popular} viewAllHref="/shop?sort=popular" />
          <ArtworkCarouselSection title="New Arrivals" subtitle="Freshly added to Artify" artworks={home.newArrivals} viewAllHref="/shop?sort=newest" />

          {/* How it works */}
          <section className="home-section">
            <div className="how-it-works">
              <h2>How it works</h2>
              <ol>
                {STEPS.map((s) => (
                  <li key={s.title}>
                    <strong>{s.title}</strong>
                    <span>{s.body}</span>
                  </li>
                ))}
              </ol>
            </div>
          </section>

          {/* Custom print CTA */}
          <section className="home-section custom-print-cta">
            <div>
              <h2>Print your own artwork</h2>
              <p>Upload a photo or design and turn it into a canvas, poster, or framed print — sized and priced instantly.</p>
              <Link to="/custom-print" className="button">Start printing</Link>
            </div>
          </section>

          {/* List artwork CTA */}
          <section className="home-section list-artwork-cta">
            <div>
              <h2>Share your art with the world</h2>
              <p>Have an artwork you'd like to sell? Submit it to Artify and let us showcase it to collectors.</p>
              <Link to="/list-your-artwork" className="button button--outline">List your artwork</Link>
            </div>
          </section>

          <TestimonialStrip reviews={home.testimonials} />
        </>
      )}
    </main>
  );
}