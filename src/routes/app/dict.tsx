import { createFileRoute } from "@tanstack/solid-router";
import { createSignal, For } from "solid-js";
import Navigation from "~/components/Navigation";
import SearchBar from "~/components/SearchBar";
import dictcss from "./dict.css?url";

export const Route = createFileRoute("/app/dict")({
  head: () => ({
    links: [{ rel: "stylesheet", href: dictcss }],
  }),
  component: DictionaryComponent,
});

// Sample dictionary data - in a real app, this would come from your backend
const sampleDictionaryData = [
  {
    word: "你好",
    pinyin: "nǐ hǎo",
    definition: "hello",
    category: "greeting",
    example: "你好！很高兴见到你。"
  },
  {
    word: "谢谢",
    pinyin: "xiè xiè",
    definition: "thank you",
    category: "expression",
    example: "谢谢你的帮助。"
  },
  {
    word: "对不起",
    pinyin: "duì bù qǐ",
    definition: "sorry",
    category: "expression",
    example: "对不起，我迟到了。"
  },
  {
    word: "再见",
    pinyin: "zài jiàn",
    definition: "goodbye",
    category: "greeting",
    example: "再见，明天见！"
  },
  {
    word: "请",
    pinyin: "qǐng",
    definition: "please",
    category: "expression",
    example: "请坐。"
  },
  {
    word: "水",
    pinyin: "shuǐ",
    definition: "water",
    category: "noun",
    example: "我想喝水。"
  }
];

function DictionaryComponent() {
  const [searchTerm, setSearchTerm] = createSignal("");
  const [selectedWord, setSelectedWord] = createSignal<any>(null);

  // Filter dictionary based on search term
  const filteredWords = () => {
    if (!searchTerm()) return sampleDictionaryData;

    return sampleDictionaryData.filter(word =>
      word.word.toLowerCase().includes(searchTerm().toLowerCase()) ||
      word.definition.toLowerCase().includes(searchTerm().toLowerCase()) ||
      word.pinyin.toLowerCase().includes(searchTerm().toLowerCase())
    );
  };

  const handleSearch = () => {
    // In a real app, this would trigger a backend search
    console.log("Searching for:", searchTerm());
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
            <div class="results-count">
              {filteredWords().length} word{filteredWords().length !== 1 ? 's' : ''} found
            </div>

            <div class="words-grid">
              <For each={filteredWords()}>
                {(word) => (
                  <div class="word-card" onClick={() => handleWordClick(word)}>
                    <div class="word-header">
                      <h3 class="word-title">{word.word}</h3>
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
          </div>
        </div>
      </main>

      {/* Word Detail Modal */}
      {selectedWord() && (
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

              <div class="word-example">
                <h4>Example:</h4>
                <p class="example-text">"{selectedWord()!.example}"</p>
              </div>

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
      )}
    </div>
  );
}
