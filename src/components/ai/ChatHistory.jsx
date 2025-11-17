import React, { useEffect, useRef } from 'react'

function ChatHistory({ history }) {
  const historyRef = useRef(null)

  useEffect(() => {
    if (historyRef.current) {
      historyRef.current.scrollTop = historyRef.current.scrollHeight
    }
  }, [history])

  return (
    <div
      ref={historyRef}
      className="flex-grow p-6 overflow-y-auto chat-history space-y-4"
    >
      {history.map((item, index) => (
        <div
          key={index}
          className={`flex ${
            item.role === 'user'? 'justify-end' : 'justify-start'
          }`}
        >
          <div
            className={`max-w-xs md:max-w-sm px-4 py-3 rounded-xl ${
              item.role === 'user'
               ? 'bg-accent-blue text-white'
                : item.role === 'system'
               ? 'bg-space-gray-light text-gray-300 italic'
                : 'bg-space-gray-light text-white'
            }`}
          >
            {item.content}
          </div>
        </div>
      ))}
    </div>
  )
}

export default ChatHistory