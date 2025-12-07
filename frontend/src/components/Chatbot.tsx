/**
 * Chatbot.tsx - Chatbot Component
 * 
 * A floating chatbot button that appears in the bottom right corner of all pages.
 * When clicked, it opens a chat interface where users can ask questions.
 * 
 * Features:
 * - Floating circular button in bottom right corner
 * - Expandable chat window
 * - Message input and display
 * - Close/minimize functionality
 */

import { useState, useRef, useEffect } from 'react'

type Theme = 'light' | 'dark'

export default function Chatbot({ theme }: { theme: Theme }) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim() || isLoading) return

    const userMessage = inputValue.trim()
    setInputValue('')
    
    // Add user message to the conversation
    const updatedMessages = [...messages, { role: 'user' as const, content: userMessage }]
    setMessages(updatedMessages)
    setIsLoading(true)

    try {
      const API_BASE_URL = 'http://localhost:8000'
      
      // Send conversation history to backend
      const response = await fetch(`${API_BASE_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: updatedMessages.map(msg => ({
            role: msg.role,
            content: msg.content,
          })),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Failed to get response' }))
        throw new Error(errorData.detail || 'Failed to get response from chatbot')
      }

      const data = await response.json()
      
      // Add assistant response to messages
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: data.message || 'I apologize, but I couldn\'t generate a response.',
        },
      ])
    } catch (err) {
      // Show error message to user
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: err instanceof Error ? err.message : 'Sorry, there was an error processing your message. Please try again.',
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const isDark = theme === 'dark'

  return (
    <>
      {/* Floating Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg focus:outline-none focus:ring-2 transition-all duration-200 flex items-center justify-center ${
          isDark
            ? 'bg-slate-800 text-white hover:bg-slate-700 focus:ring-slate-500 focus:ring-offset-slate-900'
            : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 focus:ring-offset-2'
        }`}
        aria-label="Open chatbot"
      >
        {isOpen ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div
          className={`fixed bottom-24 right-6 z-50 w-96 h-[500px] rounded-lg shadow-2xl border flex flex-col ${
            isDark ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-200'
          }`}
        >
          {/* Chat Header */}
          <div
            className={`px-4 py-3 rounded-t-lg flex items-center justify-between ${
              isDark ? 'bg-slate-800 text-white' : 'bg-blue-600 text-white'
            }`}
          >
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              <h3 className="font-semibold">MediData Assistant</h3>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-slate-200 focus:outline-none"
              aria-label="Close chatbot"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className={`text-center mt-8 ${isDark ? 'text-slate-300' : 'text-slate-500'}`}>
                <p className="text-sm">Welcome! How can I help you today?</p>
                <p className="text-xs mt-2">Ask me anything about providers, requests, or MediData.</p>
              </div>
            ) : (
              messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-2 ${
                      message.role === 'user'
                        ? isDark
                          ? 'bg-slate-700 text-white'
                          : 'bg-blue-600 text-white'
                        : isDark
                          ? 'bg-slate-800 text-slate-100 border border-slate-700'
                          : 'bg-slate-100 text-slate-900'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
              ))
            )}
            {isLoading && (
              <div className="flex justify-start">
                <div className={`rounded-lg px-4 py-2 ${isDark ? 'bg-slate-800 text-slate-200' : 'bg-slate-100'}`}>
                  <div className="flex gap-1">
                    <div className={`w-2 h-2 rounded-full animate-bounce ${isDark ? 'bg-slate-300' : 'bg-slate-400'}`} style={{ animationDelay: '0ms' }} />
                    <div className={`w-2 h-2 rounded-full animate-bounce ${isDark ? 'bg-slate-300' : 'bg-slate-400'}`} style={{ animationDelay: '150ms' }} />
                    <div className={`w-2 h-2 rounded-full animate-bounce ${isDark ? 'bg-slate-300' : 'bg-slate-400'}`} style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <form
            onSubmit={handleSendMessage}
            className={`border-t p-4 ${isDark ? 'border-slate-700 bg-slate-900' : 'border-slate-200 bg-white'}`}
          >
            <div className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type your message..."
                className={`flex-1 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 ${
                  isDark
                    ? 'border border-slate-700 bg-slate-800 text-white placeholder:text-slate-400 focus:border-slate-500 focus:ring-slate-500'
                    : 'border border-slate-300 focus:border-blue-500 focus:ring-blue-500'
                }`}
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || isLoading}
                className={`rounded-md px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 disabled:cursor-not-allowed ${
                  isDark
                    ? 'bg-slate-700 text-white hover:bg-slate-600 focus:ring-slate-500 disabled:bg-slate-600'
                    : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-300'
                }`}
              >
                Send
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  )
}
