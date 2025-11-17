import React, { useState } from 'react'

function ChatInput({ onSubmit, isLoading }) {
  const [input, setInput] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (input.trim() &&!isLoading) {
      onSubmit(input)
      setInput('')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="p-6 border-t border-space-gray-light flex-shrink-0">
      <div className="flex rounded-lg bg-space-gray-light overflow-hidden">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={isLoading? 'Waiting for response...' : 'Ask about this scale...'}
          className="flex-grow p-3 bg-transparent text-white placeholder-gray-500 focus:outline-none"
          disabled={isLoading}
        />
        <button
          type="submit"
          className="p-3 bg-accent-blue hover:bg-accent-blue-light text-white transition-colors disabled:opacity-50"
          disabled={isLoading}
        >
          {isLoading? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          )}
        </button>
      </div>
    </form>
  )
}

export default ChatInput