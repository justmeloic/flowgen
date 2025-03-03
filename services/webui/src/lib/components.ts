import { ChatInput } from '@/components/chat-input'
import { SearchBar } from '@/components/search-bar'
import { ModelSelector } from '@/components/model-selector'
import { MessageActions } from '@/components/message-actions'
import { FileChip } from '@/components/file-chip'
import { SearchSuggestions } from '@/components/search-suggestions'
import { SearchResults } from '@/components/search-results'

export const allComponents = [
  {
    name: 'ChatInput',
    slug: 'chat-input',
    component: ChatInput,
    description:
      'A versatile input component for chat interfaces with file upload and voice recording capabilities.',
    code: `
import { ChatInput } from "@/components/chat-input"

export default function ChatPage() {
  const handleSend = (userMessage: string) => {
    // Handle sending the message
  }

  return (
    <ChatInput onSend={handleSend} />
  )
}`,
    props: [
      {
        name: 'onSend',
        type: '(userMessage: string) => void',
        default: '',
        description: 'Function called when a message is sent.',
      },
    ],
  },
  {
    name: 'SearchBar',
    slug: 'search-bar',
    component: SearchBar,
    description:
      'A comprehensive search bar component with file upload functionality.',
    code: `
import { SearchBar } from "@/components/search-bar"
import { useRef, useState } from "react"

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const searchInputRef = useRef<HTMLInputElement>(null)

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    // Perform search operation
  }

  return (
    <SearchBar 
      onSearch={handleSearch} 
      inputRef={searchInputRef} 
      externalQuery={searchQuery} 
    />
  )
}`,
    props: [
      {
        name: 'onSearch',
        type: '(query: string) => void',
        default: '',
        description: 'Function called when a search is performed.',
      },
      {
        name: 'inputRef',
        type: 'React.RefObject<HTMLInputElement>',
        default: '',
        description: 'Ref for the search input element.',
      },
      {
        name: 'externalQuery',
        type: 'string',
        default: '',
        description: 'External query to set the search bar value.',
      },
    ],
  },
  {
    name: 'ModelSelector',
    slug: 'model-selector',
    component: ModelSelector,
    description: 'A dropdown component for selecting AI models.',
    code: `
import { ModelSelector } from "@/components/model-selector"

export default function ChatPage() {
  return (
    <div className="flex items-center justify-between p-4 border-b border-gray-200">
      <ModelSelector />
      {/* Other components */}
    </div>
  )
}`,
    props: [],
  },
  {
    name: 'MessageActions',
    slug: 'message-actions',
    component: MessageActions,
    description: 'A component providing action buttons for chat messages.',
    code: `
import { MessageActions } from "@/components/message-actions"

export default function ChatMessage({ message }: { message: string }) {
  return (
    <div>
      <p>{message}</p>
      <MessageActions message={message} />
    </div>
  )
}`,
    props: [
      {
        name: 'message',
        type: 'string',
        default: '',
        description: 'The message content to perform actions on.',
      },
    ],
  },
  {
    name: 'FileChip',
    slug: 'file-chip',
    component: FileChip,
    description: 'A component for displaying uploaded file information.',
    code: `
import { FileChip } from "@/components/file-chip"

export default function UploadedFiles({ files }: { files: File[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {files.map((file, index) => (
        <FileChip
          key={index}
          fileName={file.name}
          fileSize={file.size}
          fileType={file.type}
          onRemove={() => {/* Handle file removal */}}
        />
      ))}
    </div>
  )
}`,
    props: [
      {
        name: 'fileName',
        type: 'string',
        default: '',
        description: 'The name of the file.',
      },
      {
        name: 'fileSize',
        type: 'number',
        default: '',
        description: 'The size of the file in bytes.',
      },
      {
        name: 'fileType',
        type: 'string',
        default: '',
        description: 'The MIME type of the file.',
      },
      {
        name: 'onRemove',
        type: '() => void',
        default: '',
        description: 'Function called when the file is removed.',
      },
    ],
  },
  {
    name: 'SearchSuggestions',
    slug: 'search-suggestions',
    component: SearchSuggestions,
    description: 'A component for displaying search suggestions.',
    code: `
import { SearchSuggestions } from "@/components/search-suggestions"

export default function SearchPage() {
  const suggestions = [
    { text: "Chat with files", icon: "plus" as const },
    { text: "Help me prepare for my meeting", icon: "none" as const },
    { text: "Summarize this document", icon: "none" as const },
  ]

  const handleSuggestionClick = (suggestion: string) => {
    // Handle suggestion click
  }

  const handleSearch = (query: string) => {
    // Perform search
  }

  return (
    <SearchSuggestions
      suggestions={suggestions}
      onSuggestionClick={handleSuggestionClick}
      onSearch={handleSearch}
    />
  )
}`,
    props: [
      {
        name: 'suggestions',
        type: "Array<{ text: string; icon?: 'plus' | 'none' }>",
        default: '',
        description: 'An array of suggestion objects.',
      },
      {
        name: 'onSuggestionClick',
        type: '(suggestion: string) => void',
        default: '',
        description: 'Function called when a suggestion is clicked.',
      },
      {
        name: 'onSearch',
        type: '(query: string) => void',
        default: '',
        description: 'Function called to perform a search.',
      },
    ],
  },
  {
    name: 'SearchResults',
    slug: 'search-results',
    component: SearchResults,
    description: 'A component for displaying search results.',
    code: `
import { SearchResults } from "@/components/search-results"

export default function SearchPage() {
  const [query, setQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)

  // Simulating a search operation
  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery)
    setIsSearching(true)
    // Perform actual search operation here
    setTimeout(() => setIsSearching(false), 1000)
  }

  return (
    <div>
      {/* SearchBar component */}
      <SearchResults query={query} isSearching={isSearching} />
    </div>
  )
}`,
    props: [
      {
        name: 'query',
        type: 'string',
        default: '',
        description: 'The current search query.',
      },
      {
        name: 'isSearching',
        type: 'boolean',
        default: 'false',
        description: 'Whether a search is currently in progress.',
      },
    ],
  },
]
