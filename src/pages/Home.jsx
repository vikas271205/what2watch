// src/pages/Home.jsx
import TrendingSection from "../components/TrendingSection";
import GenresSection from "../components/GenresSection";
import TodayPick from "../components/TodaysPick";
import NewsletterSection from "../components/NewsLetterSection";
import Footer from "../components/Footer";

function Home() {
  return (
    <main className="text-white bg-black">
      {/* <section className="px-4 sm:px-6 md:px-10 py-6">
        <TodayPick />
      </section> */}

      <section className="px-4 sm:px-6 md:px-10 py-6">
        <TrendingSection />
      </section>

      <section className="px-4 sm:px-6 md:px-10 py-6">
        <GenresSection />
      </section>

      <section className="px-4 sm:px-6 md:px-10 py-6">
        <NewsletterSection />
      </section>

      <Footer />
    </main>
  );
}

export default Home;
