
import React, { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { userService } from "@/services/userService";
import { Search } from "lucide-react";

interface UserSearchAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const UserSearchAutocomplete: React.FC<UserSearchAutocompleteProps> = ({
  value,
  onChange,
  placeholder = "Search by name or email",
  className = ""
}) => {
  const [suggestions, setSuggestions] = useState<{ id: string; name: string }[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Fetch suggestions if user is typing a name (min 2 chars)
    if (value.trim().length >= 2) {
      setLoading(true);
      userService
        .searchUsers(value.trim(), 6)
        .then(users =>
          setSuggestions(
            users
              .filter(u => u.name)
              .map(u => ({ id: u.id, name: u.name }))
          )
        )
        .finally(() => setLoading(false));
    } else {
      setSuggestions([]);
    }
  }, [value]);

  // Hide suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
        setHighlightIndex(-1);
      }
    };
    if (showSuggestions) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showSuggestions]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      setHighlightIndex(i => Math.min(i + 1, suggestions.length - 1));
      e.preventDefault();
    } else if (e.key === "ArrowUp") {
      setHighlightIndex(i => Math.max(i - 1, 0));
      e.preventDefault();
    } else if (e.key === "Enter" && highlightIndex >= 0) {
      const selected = suggestions[highlightIndex];
      onChange(selected.name); // Replace value with the chosen name
      setShowSuggestions(false);
      setHighlightIndex(-1);
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
      setHighlightIndex(-1);
    }
  };

  return (
    <div
      className={`relative w-full ${className}`}
      ref={containerRef}
    >
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
      <Input
        className="pl-10"
        value={value}
        onFocus={() => {
          if (suggestions.length > 0) setShowSuggestions(true);
        }}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
        onChange={e => {
          onChange(e.target.value);
          setShowSuggestions(true);
        }}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        autoComplete="off"
      />
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 left-0 right-0 mt-1 bg-white border rounded shadow-lg max-h-48 overflow-y-auto">
          {suggestions.map((user, idx) => (
            <div
              key={user.id}
              className={`cursor-pointer px-4 py-2 hover:bg-primary/10 ${highlightIndex === idx ? "bg-primary/10" : ""}`}
              onMouseDown={() => {
                onChange(user.name);
                setShowSuggestions(false);
                setHighlightIndex(-1);
              }}
              onMouseEnter={() => setHighlightIndex(idx)}
            >
              {user.name}
            </div>
          ))}
        </div>
      )}
      {showSuggestions && loading && (
        <div className="absolute z-50 left-0 right-0 mt-1 bg-white border rounded shadow-lg px-4 py-2">
          Loading...
        </div>
      )}
      {showSuggestions && !loading && value.length >= 2 && suggestions.length === 0 && (
        <div className="absolute z-50 left-0 right-0 mt-1 bg-white border rounded shadow-lg px-4 py-2 text-muted-foreground">
          No suggestions found.
        </div>
      )}
    </div>
  );
};
