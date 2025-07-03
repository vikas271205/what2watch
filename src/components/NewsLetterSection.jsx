import { useState } from "react";

function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [error, setError] = useState("");

  const handleSubscribe = (e) => {
    e.preventDefault();

    if (!email.includes("@")) {
      setError("Please enter a valid email.");
      return;
    }

    // You can integrate with Mailchimp, Firebase, etc., here
    setSubscribed(true);
    setError("");
    setEmail("");
  };

  return (
    <section className="px-6 py-16 bg-gray-900 text-white text-center">
      <h2 className="text-2xl font-bold mb-3">📬 Stay Updated!</h2>
      <p className="text-gray-300 mb-6">
        Get updates on new releases, top picks & weekend recommendations.
      </p>

      <form
        onSubmit={handleSubscribe}
        className="flex flex-col sm:flex-row justify-center gap-4 max-w-xl mx-auto"
      >
        <input
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="px-4 py-3 rounded w-full sm:w-auto flex-grow text-black"
          required
        />
        <button
          type="submit"
          className="bg-indigo-600 hover:bg-indigo-500 px-6 py-3 rounded text-white font-semibold transition"
        >
          Subscribe
        </button>
      </form>

      {subscribed && (
        <p className="mt-4 text-green-400 font-medium">Thanks for subscribing!</p>
      )}
      {error && (
        <p className="mt-4 text-red-400 font-medium">{error}</p>
      )}
    </section>
  );
}

export default NewsletterSection;
