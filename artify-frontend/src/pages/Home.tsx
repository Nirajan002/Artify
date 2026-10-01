import { Link } from "react-router-dom";
import { useGetHomeDataQuery } from "../features/artworks/artworksApi";
import ArtworkCarouselSection from "../components/ArtworkCarouselSection";
import CategoryStrip from "../components/CategoryStrip";
import TestimonialStrip from "../components/TestimonialStrip";

const STEPS = [
  { step: "01", title: "Browse or upload", body: "Find art or upload yours" },
  { step: "02", title: "Customize", body: "Pick size, paper & frame" },
  { step: "03", title: "We print & ship", body: "Delivered to your door" },
  { step: "04", title: "Enjoy your art", body: "Ready to hang & love" },
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
              <div className="how-it-works__head">
                <h2>How it works</h2>
                <span className="how-it-works__pill">4 Simple Steps</span>
              </div>
              <div className="how-it-works__flow">
                {STEPS.map((s, idx) => (
                  <div key={s.title} className="how-it-works__flow-item">
                    <div className="how-it-works__step">
                      <div className="how-it-works__step-head">
                        <span className="how-it-works__num">{s.step}</span>
                        <strong className="how-it-works__title">{s.title}</strong>
                      </div>
                      <span className="how-it-works__desc">{s.body}</span>
                    </div>
                    {idx < STEPS.length - 1 && (
                      <div
                        className={`how-it-works__arrow ${idx === 1 ? "how-it-works__arrow--mid" : ""}`}
                        aria-hidden="true"
                      >
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <line x1="3" y1="12" x2="21" y2="12" />
                          <polyline points="15 6 21 12 15 18" />
                        </svg>
                      </div>
                    )}
                  </div>
                ))}
              </div>
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