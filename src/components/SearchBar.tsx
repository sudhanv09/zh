import type { Component } from 'solid-js';
import './SearchBar.css';

interface SearchBarProps {
  placeholder?: string;
  value: string;
  onInput: (value: string) => void;
  onSearch?: () => void;
  className?: string;
}

const SearchBar: Component<SearchBarProps> = (props) => {
  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && props.onSearch) {
      props.onSearch();
    }
  };

  return (
    <div class={`search-container ${props.className || ''}`}>
      <div class="search-input-container">
        <input
          type="text"
          value={props.value}
          onInput={(e) => props.onInput(e.currentTarget.value)}
          onKeyPress={handleKeyPress}
          placeholder={props.placeholder || "Search..."}
          class="search-input"
        />
        <button
          onClick={props.onSearch}
          class="search-button"
        >
          <i class="fas fa-search"></i>
        </button>
      </div>
    </div>
  );
};

export default SearchBar;