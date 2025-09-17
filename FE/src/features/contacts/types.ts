export interface ContactMessage {
  id: string
  seekerId: string
  message: string
  timestamp: string
  isOwn: boolean
}

export interface ContactThread {
  seekerId: string
  messages: ContactMessage[]
  notes: string
}

export interface ContactLog {
  seekerId: string
  action: 'contact_opened' | 'message_sent' | 'note_added'
  timestamp: string
  metadata?: any
}