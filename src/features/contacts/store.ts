import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { ContactThread, ContactMessage, ContactLog } from './types'

interface ContactsState {
  threads: ContactThread[]
  logs: ContactLog[]
  getThread: (seekerId: string) => ContactThread | undefined
  addMessage: (seekerId: string, message: string) => void
  addNote: (seekerId: string, note: string) => void
  logAction: (seekerId: string, action: ContactLog['action'], metadata?: any) => void
}

export const useContactsStore = create<ContactsState>()(
  persist(
    (set, get) => ({
      threads: [],
      logs: [],
      
      getThread: (seekerId: string) => {
        return get().threads.find(thread => thread.seekerId === seekerId)
      },
      
      addMessage: (seekerId: string, message: string) => {
        const { threads } = get()
        const existingThread = threads.find(t => t.seekerId === seekerId)
        
        const newMessage: ContactMessage = {
          id: Date.now().toString(),
          seekerId,
          message,
          timestamp: new Date().toISOString(),
          isOwn: true
        }
        
        if (existingThread) {
          set({
            threads: threads.map(thread =>
              thread.seekerId === seekerId
                ? { ...thread, messages: [...thread.messages, newMessage] }
                : thread
            )
          })
        } else {
          const newThread: ContactThread = {
            seekerId,
            messages: [newMessage],
            notes: ''
          }
          set({ threads: [...threads, newThread] })
        }
        
        get().logAction(seekerId, 'message_sent', { message })
      },
      
      addNote: (seekerId: string, note: string) => {
        const { threads } = get()
        const existingThread = threads.find(t => t.seekerId === seekerId)
        
        if (existingThread) {
          set({
            threads: threads.map(thread =>
              thread.seekerId === seekerId
                ? { ...thread, notes: note }
                : thread
            )
          })
        } else {
          const newThread: ContactThread = {
            seekerId,
            messages: [],
            notes: note
          }
          set({ threads: [...threads, newThread] })
        }
        
        get().logAction(seekerId, 'note_added', { note })
      },
      
      logAction: (seekerId: string, action: ContactLog['action'], metadata?: any) => {
        const newLog: ContactLog = {
          seekerId,
          action,
          timestamp: new Date().toISOString(),
          metadata
        }
        
        set({ logs: [newLog, ...get().logs] })
        
        console.log('Contact Action:', {
          seekerId,
          action,
          timestamp: newLog.timestamp,
          metadata
        })
      }
    }),
    {
      name: 'immofy-contacts'
    }
  )
)