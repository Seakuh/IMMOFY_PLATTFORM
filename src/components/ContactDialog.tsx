import { useState, useRef, useEffect } from 'react'
import { X, Send, StickyNote, MessageSquare } from 'lucide-react'
import { Seeker } from '@/features/seekers/types'
import { useContactsStore } from '@/features/contacts/store'
import { formatDate } from '@/lib/utils'

interface ContactDialogProps {
  seeker: Seeker
  isOpen: boolean
  onClose: () => void
}

export default function ContactDialog({ seeker, isOpen, onClose }: ContactDialogProps) {
  const [message, setMessage] = useState('')
  const [note, setNote] = useState('')
  const [activeTab, setActiveTab] = useState<'messages' | 'notes'>('messages')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  const { getThread, addMessage, addNote, logAction } = useContactsStore()
  const thread = getThread(seeker.id)

  useEffect(() => {
    if (thread) {
      setNote(thread.notes)
    }
  }, [thread])

  useEffect(() => {
    if (isOpen) {
      logAction(seeker.id, 'contact_opened')
    }
  }, [isOpen, seeker.id, logAction])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [thread?.messages])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const handleSendMessage = () => {
    if (message.trim()) {
      console.log(`Message sent to ${seeker.name || 'Unknown'} (ID: ${seeker.id}): ${message.trim()}`);
      addMessage(seeker.id, message.trim())
      setMessage('')
    }
  }

  const handleSaveNote = () => {
    addNote(seeker.id, note)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (activeTab === 'messages') {
        handleSendMessage()
      }
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      
      <div className="absolute inset-x-4 inset-y-4 md:inset-x-8 md:inset-y-8 lg:left-1/2 lg:top-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2 lg:w-full lg:max-w-2xl lg:h-auto lg:max-h-[80vh] bg-white rounded-2xl shadow-2xl flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mr-4">
              {seeker.avatarUrl ? (
                <img
                  src={seeker.avatarUrl}
                  alt={seeker.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <span className="text-gray-500 font-semibold">
                  {seeker.name?.charAt(0).toUpperCase() || '?'}
                </span>
              )}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{seeker.name || 'Unbekannt'}</h3>
              <p className="text-sm text-gray-500">Kontakt</p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('messages')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'messages'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <MessageSquare size={16} className="inline mr-2" />
            Nachrichten
            {thread?.messages && thread.messages.length > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-600 rounded-full text-xs">
                {thread.messages.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('notes')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'notes'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <StickyNote size={16} className="inline mr-2" />
            Notizen
          </button>
        </div>

        <div className="flex-1 overflow-hidden">
          {activeTab === 'messages' ? (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-96">
                {thread?.messages && thread.messages.length > 0 ? (
                  thread.messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.isOwn ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                          msg.isOwn
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <p className="text-sm">{msg.message}</p>
                        <p className={`text-xs mt-1 ${
                          msg.isOwn ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                          {formatDate(msg.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    <MessageSquare size={48} className="mx-auto mb-4 text-gray-300" />
                    <p>Noch keine Nachrichten</p>
                    <p className="text-sm">Sende die erste Nachricht!</p>
                  </div>
                )}
                
                {/* Show a preview of sent message */}
                {thread?.messages && thread.messages.length > 0 && thread.messages[thread.messages.length - 1].isOwn && (
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800">
                      <strong>Du hast geschrieben:</strong> {thread.messages[thread.messages.length - 1].message}
                    </p>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="border-t border-gray-200 p-4">
                <div className="flex space-x-2">
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Nachricht eingeben..."
                    className="flex-1 resize-none border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={2}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!message.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Send size={16} />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="p-4 h-full flex flex-col">
              <div className="flex-1">
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Private Notizen zu diesem Kontakt..."
                  className="w-full h-full min-h-[200px] resize-none border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="mt-4">
                <button
                  onClick={handleSaveNote}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Notiz speichern
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}