import { createFileRoute, useNavigate } from "@tanstack/solid-router";
import { createServerFn } from "@tanstack/solid-start";
import { cardsToReview, updateFlashcard } from "~/service/vocabulary-loader";
import { createSignal, Show } from "solid-js";
import reviewpagecss from "./review.css?url";
import { Rating } from "ts-fsrs";
import { processReview } from "~/service/fsrs";
import type { FlashcardData } from "~/types/flashcard";

const getCards = createServerFn({
  method: "GET",
}).handler(() => {
  return cardsToReview();
});

const updateProgress = createServerFn()
  .validator((c: FlashcardData) => c)
  .handler(async (ctx) => {
    return await updateFlashcard(ctx.data);
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
  const navigate = useNavigate();
  const [count, setCount] = createSignal(0);
  const [showAnswer, setShowAnswer] = createSignal(false);

  const currentCard = () => state()?.[count()];
  const progress = state()
    ? Math.round(((count() + 1) / state().length) * 100)
    : 0;

  const nextVal = () => {
    setCount((prev) => (prev === state.length - 1 ? 0 : prev + 1));
    setShowAnswer(false);
  };

  const handleRating = (rating: Rating) => {
    const updatedCard = processReview(currentCard(), rating);
    updateProgress({ data: updatedCard });

    setShowAnswer(true);
    setTimeout(nextVal, 1500);
  };

  return (
    <div class="reviewContainer">
      <div class="progressBar">
        <div class="progressFill" style={{ width: `${progress}%` }}></div>
      </div>

      <div class="progressText">
        <span class="currentCard">{count() + 1}</span> /{" "}
        <span class="totalCards">{state()?.length || 0}</span> cards
      </div>

      <div class="reviewCard">
        <div class="cardHeader">
          <div class="characterDisplay">{currentCard()?.vocabulary}</div>
        </div>

        <Show when={showAnswer()}>
          <p>{currentCard()?.pinyin}</p>
        </Show>
      </div>

      <div class="ratingButtons">
        <button
          class="ratingButton again"
          onClick={() => handleRating(Rating.Again)}
          disabled={showAnswer()}
        >
          Again
        </button>
        <button
          class="ratingButton hard"
          onClick={() => handleRating(Rating.Hard)}
          disabled={showAnswer()}
        >
          Hard
        </button>
        <button
          class="ratingButton good"
          onClick={() => handleRating(Rating.Good)}
          disabled={showAnswer()}
        >
          Good
        </button>
        <button
          class="ratingButton easy"
          onClick={() => handleRating(Rating.Easy)}
          disabled={showAnswer()}
        >
          Easy
        </button>
      </div>

      <div class="controlButtons">
        <button class="quitButton" onClick={() => navigate({ to: "/" })}>
          Quit to Home
        </button>
      </div>
    </div>
  );
}
