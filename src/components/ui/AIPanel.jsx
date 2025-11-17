import React, { useState, useEffect } from 'react'
import { useSceneStore } from '../../hooks/useSceneStore'
import ChatHistory from '../ai/ChatHistory'
import ChatInput from '../ai/ChatInput'
// PENTING: Ganti ini ke helper baru yang akan kita buat
import { fetchLocalAIResponse } from '../../api/openai'

function AIPanel() {
  const { isAIPanelOpen, currentScale } = useSceneStore()
  const [chatHistory, setChatHistory] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  // Add a context-aware welcome message when the panel is opened or scale changes
  useEffect(() => {
    if (isAIPanelOpen) {
      const scaleName = currentScale.charAt(0).toUpperCase() + currentScale.slice(1);
      const welcomeMessage = {
        role: 'system',
        content: `You are now viewing the ${scaleName} scale. Ask me anything!`
      };
      // Add welcome message if it's not already the last message
      if (chatHistory.length === 0 || chatHistory[chatHistory.length - 1].content !== welcomeMessage.content) {
        setChatHistory([welcomeMessage]);
      }
    }
    // [PERBAIKAN]: Menambahkan dependency array agar useEffect ini
    // berjalan setiap kali panel dibuka atau scene berubah.
  }, [isAIPanelOpen, currentScale])

  const handleSubmit = async (message) => {
    setError(null)
    setIsLoading(true)
    const newUserMessage = { role: 'user', content: message }
    const newChatHistory = [...chatHistory, newUserMessage]
    setChatHistory(newChatHistory)

    try {
      // [PERBAIKAN]: Memanggil fungsi fetch ke backend LOKAL Anda
      const aiResponse = await fetchLocalAIResponse(message, newChatHistory, currentScale)
      const newAiMessage = { role: 'assistant', content: aiResponse }
      setChatHistory([...newChatHistory, newAiMessage])
    } catch (err) {
      console.error(err)
      setError('Failed to get response from AI. Check your server and network.')
      const errorMessage = { role: 'system', content: 'Error: Could not connect to AI.' }
      setChatHistory([...newChatHistory, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div
      className={`fixed top-0 right-0 h-full w-full max-w-md bg-space-gray-dark shadow-lg z-40 transform transition-transform duration-500 ease-in-out ${
        isAIPanelOpen? 'translate-x-0' : 'translate-x-full'
      } pointer-events-auto flex flex-col`}
    >
      <div className="p-6 pt-20 flex-shrink-0">
        <h2 className="text-2xl font-bold text-white">AI Assistant</h2>
        <p className="text-sm text-gray-400">
          Context: <span className="font-bold text-accent-blue-light">{currentScale}</span>
        </p>
      </div>

      {error && (
        <div className="mx-6 p-3 bg-red-800 text-white rounded-lg text-sm">
          {error}
        </div>
      )}

      <ChatHistory history={chatHistory} />
      <ChatInput onSubmit={handleSubmit} isLoading={isLoading} />
    </div>
  )
}

export default AIPanel