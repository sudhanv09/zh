import { createFileRoute, useNavigate } from '@tanstack/solid-router'
import { For } from 'solid-js'
import './index.css'

export const Route = createFileRoute('/')({
  component: IndexComponent,
})

function IndexComponent() {
  const navigate = useNavigate()

  const cards = [
    {
      title: "Review Cards",
      description: "Practice and review your flashcards with spaced repetition",
      icon: "📚",
      href: "/app/review"
    },
    {
      title: "Study Progress",
      description: "Track your learning progress and statistics",
      icon: "📊",
      href: "/app/progress"
    },
    {
      title: "Create Cards",
      description: "Add new flashcards to your collection",
      icon: "➕",
      href: "/app/create"
    }
  ]

  const handleCardClick = (href: string) => {
    navigate({ to: href })
  }

  return (
    <div class="homeContainer">
      <header class="homeHeader">
        <h1 class="homeTitle">Flashcard Master</h1>
        <p class="homeSubtitle">Master your learning with spaced repetition</p>
        <p class="homeDescription">
          Welcome to Flashcard Master, your intelligent flashcard review app.
          Use spaced repetition to memorize information efficiently and track your progress over time.
        </p>
      </header>

      <div class="cardsContainer">
        <For each={cards}>
          {(card) => (
            <div
              class="card"
              onClick={() => handleCardClick(card.href)}
            >
              <div class="cardIcon">{card.icon}</div>
              <h2 class="cardTitle">{card.title}</h2>
              <p class="cardDescription">{card.description}</p>
              <a href={card.href} class="cardLink" onclick={(e) => e.preventDefault()}>
                Get Started
                <span class="cardArrow">→</span>
              </a>
            </div>
          )}
        </For>
      </div>
    </div>
  )
}
