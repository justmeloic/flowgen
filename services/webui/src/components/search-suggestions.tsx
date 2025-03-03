'use client'
import { Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SearchSuggestionProps {
  suggestions: Array<{
    text: string
    icon?: 'plus' | 'none'
  }>
  onSuggestionClick: (suggestion: string) => void
  onSearch: (query: string) => void
}

export function SearchSuggestions({
  suggestions = [],
  onSuggestionClick,
  onSearch,
}: SearchSuggestionProps) {
  return (
    <>
      {suggestions && suggestions.length > 0 ? (
        <div className="absolute left-0 right-0 top-full mt-3 flex flex-wrap gap-2 py-3">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => {
                onSuggestionClick(suggestion.text)
                onSearch(suggestion.text)
              }}
              className={cn(
                'flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2',
                'text-sm text-gray-700 transition-colors hover:bg-primary/10',
                'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2'
              )}
            >
              {suggestion.icon === 'plus' && (
                <Plus className="h-4 w-4 text-primary" />
              )}
              {suggestion.text}
            </button>
          ))}
        </div>
      ) : (
        <div className="absolute left-0 right-0 top-full mt-1 px-4 py-3 text-gray-500">
          No suggestions available
        </div>
      )}
    </>
  )
}
