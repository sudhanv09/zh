import { createFileRoute } from "@tanstack/solid-router";
import { createServerFn } from "@tanstack/solid-start";
import { cardsToReview } from "../service/vocabulary-loader";
import { For } from "solid-js";

const getCards = createServerFn({
  method: "GET",
}).handler(() => {
  return cardsToReview();
});

export const Route = createFileRoute("/app/review")({
  component: Home,
  loader: async () => await getCards(),
});

function Home() {
  const state = Route.useLoaderData();

  return (
    <div>
      <For each={state()}>{(item) => <li>{item.vocabulary}</li>}</For>
    </div>
  );
}
