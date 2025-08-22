import { createFileRoute } from "@tanstack/solid-router";
import { createServerFn } from "@tanstack/solid-start";
import { cardsToReview, updateFlashcard } from "~/service/vocabulary-loader";
import { createSignal } from "solid-js";
import reviewpagecss from "./review.css?url";
import type { UserRating } from "~/types/flashcard";

const getCards = createServerFn({
  method: "GET",
}).handler(() => {
  return cardsToReview();
});

const updateCard = createServerFn({
  method: "POST",
}).handler(() => {
  return cardsToReview();
});

export const Route = createFileRoute("/app/review")({
  head: () => ({
    links: [{ rel: "stylesheet", href: reviewpagecss }],
  }),
  component: Home,
  loader: async () => await getCards(),
});

function Home() {
  const state = Route.useLoaderData();
  const [count, setCount] = createSignal(0);
  const [showAnswer, setShowAnswer] = createSignal(false);
  const [userRating, setUserRating] = createSignal<UserRating | null>(null);

  const nextVal = () => {
    setCount((prev) => (prev === state.length - 1 ? 0 : prev + 1));
    setShowAnswer(false);
    setUserRating(null);
  };

  const handleRating = (rating: UserRating) => {
    setUserRating(rating);
    setShowAnswer(true);
  };

  const handleQuit = () => {
    window.location.href = "/";
  };

  const currentCard = state()?.[count()];

  return (
    <div class="reviewContainer">
      <div class="card">
        <div class="vocabularyItem">{currentCard?.vocabulary}</div>
        <div class="pinyin">{currentCard?.pinyin}</div>

        {showAnswer() && (
          <div class="answer">Answer: {currentCard?.vocabulary}</div>
        )}

        {userRating() && (
          <div class="userRating">Your rating: {userRating()}</div>
        )}
      </div>

      <div class="ratingButtons">
        <button
          class={"ratingButton again"}
          onClick={() => handleRating("again" as unknown as UserRating)}
        >
          Again
        </button>
        <button
          class={"ratingButton hard"}
          onClick={() => handleRating("hard" as unknown as UserRating)}
        >
          Hard
        </button>
        <button
          class={"ratingButton good"}
          onClick={() => handleRating("good" as unknown as UserRating)}
        >
          Good
        </button>
        <button
          class={"ratingButton easy"}
          onClick={() => handleRating("easy" as unknown as UserRating)}
        >
          Easy
        </button>
      </div>

      <div class="controlButtons">
        <button class="quitButton" onClick={handleQuit}>
          Quit
        </button>
        <button class="resetButton" disabled>
          Reset
        </button>
      </div>
    </div>
  );
}
