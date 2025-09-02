import { createFileRoute } from "@tanstack/solid-router";
import {
  createSignal,
  For,
  createEffect,
  onCleanup,
  Show,
  Switch,
  Match,
} from "solid-js";
import Navigation from "~/components/Navigation";
import SearchBar from "~/components/SearchBar";
import { searchDictionary } from "~/server/dictionary";
import type { CCDict } from "~/types/dictionary";
import dictcss from "./dict.css?url";

export const Route = createFileRoute("/app/dict")({
  head: () => ({
    links: [{ rel: "stylesheet", href: dictcss }],
  }),
  component: DictionaryComponent,
});

// Helper function to convert CCDict to display format
function formatDictionaryEntry(entry: CCDict) {
  return {
    word: entry.simplified,
    traditional: entry.traditional,
    pinyin: entry.pinyin,
    definition: entry.definition.join("; "),
    category: "word", // Default category since CCDict doesn't have categories
    example: "", // CCDict doesn't include examples
  };
}

function DictionaryComponent() {
  const [searchTerm, setSearchTerm] = createSignal("");
  const [selectedWord, setSelectedWord] = createSignal<any>(null);
  const [searchResults, setSearchResults] = createSignal<CCDict[]>([]);
  const [isLoading, setIsLoading] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);
  const [totalCount, setTotalCount] = createSignal(0);

  let debounceTimeout: ReturnType<typeof setTimeout> | undefined;

  // Debounced search effect - triggers search 300ms after user stops typing
  createEffect(() => {
    const term = searchTerm();

    // Clear previous timeout
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }

    // If search term is empty, clear results
    if (!term.trim()) {
      setSearchResults([]);
      setTotalCount(0);
      setError(null);
      return;
    }

    // Set up debounced search
    debounceTimeout = setTimeout(async () => {
      await performSearch(term);
    }, 300);
  });

  // Cleanup timeout on component unmount
  onCleanup(() => {
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }
  });

  // Perform the actual search
  const performSearch = async (query: string) => {
    if (!query.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await searchDictionary({ data: query });

      if (response.success && response.data) {
        setSearchResults(response.data.entries);
        setTotalCount(response.data.totalCount);
      } else {
        setError(response.error?.message || "Search failed");
        setSearchResults([]);
        setTotalCount(0);
      }
    } catch (err) {
      console.error("Search error:", err);
      setError("Failed to search dictionary. Please try again.");
      setSearchResults([]);
      setTotalCount(0);
    } finally {
      setIsLoading(false);
    }
  };

  // Get formatted words for display
  const displayWords = () => {
    return searchResults().map(formatDictionaryEntry);
  };

  const handleSearch = () => {
    // Manual search trigger - perform search immediately
    const term = searchTerm();
    if (term.trim()) {
      performSearch(term);
    }
  };

  const handleWordClick = (word: any) => {
    setSelectedWord(word);
  };

  const closeModal = () => {
    setSelectedWord(null);
  };

  return (
    <div class="dictionary-container">
      <Navigation />

      <main class="dictionary-main">
        <div class="dictionary-content">
          <header class="dictionary-header">
            <h1 class="dictionary-title">Dictionary</h1>
            <p class="dictionary-subtitle">Search and explore Chinese words</p>
          </header>

          <div class="search-section">
            <SearchBar
              placeholder="Search for words..."
              value={searchTerm()}
              onInput={setSearchTerm}
              onSearch={handleSearch}
            />
          </div>

          <div class="results-section">
            <Switch>
              <Match when={isLoading()}>
                <div class="loading-state">
                  <div class="loading-spinner"></div>
                  <p>Searching dictionary...</p>
                </div>
              </Match>

              <Match when={error() && !isLoading()}>
                <div class="error-state">
                  <div class="error-icon">⚠️</div>
                  <p class="error-message">{error()}</p>
                  <button
                    class="retry-btn"
                    onClick={() => performSearch(searchTerm())}
                  >
                    Try Again
                  </button>
                </div>
              </Match>

              <Match
                when={
                  !isLoading() &&
                  !error() &&
                  searchTerm() &&
                  displayWords().length > 0
                }
              >
                <div class="results-count">
                  {totalCount()} word{totalCount() !== 1 ? "s" : ""} found
                  <Show when={displayWords().length < totalCount()}>
                    <span class="results-note">
                      {" "}
                      (showing first {displayWords().length})
                    </span>
                  </Show>
                </div>

                <div class="words-grid">
                  <For each={displayWords()}>
                    {(word) => (
                      <div
                        class="word-card"
                        onClick={() => handleWordClick(word)}
                      >
                        <div class="word-header">
                          <h3 class="word-title">{word.word}</h3>
                          <Show when={word.traditional !== word.word}>
                            <span class="word-traditional">
                              ({word.traditional})
                            </span>
                          </Show>
                          <span class="word-category">{word.category}</span>
                        </div>
                        <p class="word-pinyin">{word.pinyin}</p>
                        <p class="word-definition">{word.definition}</p>
                        <div class="word-actions">
                          <button class="action-btn primary">
                            <i class="fas fa-plus"></i>
                            Add to Cards
                          </button>
                          <button class="action-btn secondary">
                            <i class="fas fa-volume-up"></i>
                            Pronounce
                          </button>
                        </div>
                      </div>
                    )}
                  </For>
                </div>
              </Match>

              <Match when={!searchTerm() && !isLoading()}>
                <div class="empty-state">
                  <div class="empty-icon">🔍</div>
                  <p class="empty-message">
                    Start typing to search the dictionary
                  </p>
                  <p class="empty-hint">
                    Search for Chinese characters, pinyin, or English words
                  </p>
                </div>
              </Match>

              <Match
                when={
                  !isLoading() &&
                  !error() &&
                  searchTerm() &&
                  displayWords().length === 0
                }
              >
                <div class="no-results-state">
                  <div class="no-results-icon">📚</div>
                  <p class="no-results-message">
                    No words found for "{searchTerm()}"
                  </p>
                  <p class="no-results-hint">
                    Try searching with different terms or check your spelling
                  </p>
                </div>
              </Match>
            </Switch>
          </div>
        </div>
      </main>

      {/* Word Detail Modal */}
      <Show when={selectedWord()}>
        <div class="modal-overlay" onClick={closeModal}>
          <div class="modal-content" onClick={(e) => e.stopPropagation()}>
            <div class="modal-header">
              <h2 class="modal-title">{selectedWord()!.word}</h2>
              <button class="modal-close" onClick={closeModal}>
                <i class="fas fa-times"></i>
              </button>
            </div>

            <div class="modal-body">
              <div class="word-detail">
                <p class="detail-pinyin">{selectedWord()!.pinyin}</p>
                <p class="detail-definition">{selectedWord()!.definition}</p>
                <div class="detail-category">{selectedWord()!.category}</div>
              </div>

              <Show when={selectedWord()!.example}>
                <div class="word-example">
                  <h4>Example:</h4>
                  <p class="example-text">"{selectedWord()!.example}"</p>
                </div>
              </Show>

              <div class="modal-actions">
                <button class="action-btn primary large">
                  <i class="fas fa-plus"></i>
                  Add to Flashcards
                </button>
                <button class="action-btn secondary large">
                  <i class="fas fa-volume-up"></i>
                  Hear Pronunciation
                </button>
              </div>
            </div>
          </div>
        </div>
      </Show>
    </div>
  );
}
