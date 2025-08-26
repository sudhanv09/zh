import { createFileRoute, useNavigate } from "@tanstack/solid-router";
import { createServerFn } from "@tanstack/solid-start";
import { cardsToReview, updateFlashcard } from "~/service/vocabulary-loader";
import { createSignal, Show, onMount } from "solid-js";
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
  const [ratings, setRatings] = createSignal({
    easy: 0 as number,
    hard: 0 as number,
    good: 0 as number,
    again: 0 as number
  });
  const [isCompleted, setIsCompleted] = createSignal(false);

  const currentCard = () => state()?.[count()];
  const progress = state()
    ? Math.round(((count() + 1) / state().length) * 100)
    : 0;

  const nextVal = () => {
    const newCount = count() === state().length - 1 ? 0 : count() + 1;
    setCount(newCount);
    setShowAnswer(false);
    
    // Check if all cards have been reviewed
    if (newCount === 0 && Object.values(ratings()).some(rating => rating > 0)) {
      setIsCompleted(true);
      setTimeout(() => setIsCompleted(false), 3000); // Hide completion message after 3 seconds
    }
  };

  const handleRating = (rating: Rating) => {
    const updatedCard = processReview(currentCard(), rating);
    updateProgress({ data: updatedCard });

    // Update ratings count
    let ratingKey: 'easy' | 'hard' | 'good' | 'again';
    switch (rating) {
      case Rating.Again:
        ratingKey = 'again';
        break;
      case Rating.Hard:
        ratingKey = 'hard';
        break;
      case Rating.Good:
        ratingKey = 'good';
        break;
      case Rating.Easy:
        ratingKey = 'easy';
        break;
    }
    setRatings(prev => ({
      ...prev,
      [ratingKey]: prev[ratingKey] + 1
    }));

    setShowAnswer(true);
    setTimeout(nextVal, 1500);
  };

  return (
    <div class="reviewContainer">
      <Show when={isCompleted()}>
        <div class="completionMessage">
          <div class="checkmark">
            <svg class="checkmark-icon" viewBox="0 0 52 52">
              <circle class="checkmark-circle" cx="26" cy="26" r="25" fill="none" />
              <path class="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
            </svg>
          </div>
          <div class="completionText">Review Complete! 🎉</div>
        </div>
      </Show>

      <div class="ratingChips">
        <div class="chip again">
          <span class="chipLabel">Again:</span>
          <span class="chipValue">{ratings().again}</span>
        </div>
        <div class="chip hard">
          <span class="chipLabel">Hard:</span>
          <span class="chipValue">{ratings().hard}</span>
        </div>
        <div class="chip good">
          <span class="chipLabel">Good:</span>
          <span class="chipValue">{ratings().good}</span>
        </div>
        <div class="chip easy">
          <span class="chipLabel">Easy:</span>
          <span class="chipValue">{ratings().easy}</span>
        </div>
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
