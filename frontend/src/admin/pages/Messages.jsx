import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import {
  LucideLoader2 as Loader2,
  LucideMail as Mail,
  LucideMailOpen as MailOpen,
} from 'lucide-react'
import SectionEyebrow from '../../components/ui/SectionEyebrow'
import Card from '../components/Card'
import { getContactMessages, markContactMessageRead } from '../api/adminResources'
import { useToast } from '../components/Toast'

export default function Messages() {
  const { push } = useToast()
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [busyIds, setBusyIds] = useState({})

  useEffect(() => {
    getContactMessages()
      .then(setMessages)
      .catch(() => push('Failed to load messages.', 'error'))
      .finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleMarkRead = async (message) => {
    setBusyIds((p) => ({ ...p, [message.id]: true }))
    setMessages((prev) => prev.map((m) => (m.id === message.id ? { ...m, is_read: true } : m)))
    try {
      await markContactMessageRead(message.id)
    } catch {
      setMessages((prev) => prev.map((m) => (m.id === message.id ? { ...m, is_read: false } : m)))
      push('Failed to mark message as read.', 'error')
    } finally {
      setBusyIds((p) => ({ ...p, [message.id]: false }))
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <SectionEyebrow>Messages</SectionEyebrow>
        <h1 className="mt-3 font-display text-2xl font-bold text-ink">Contact Inbox</h1>
      </div>

      <Card title="contact-messages.list">
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="animate-spin text-ink/30" size={24} />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <Mail className="text-ink/20" size={28} />
            <p className="font-mono text-xs text-ink/40">No messages yet.</p>
          </div>
        ) : (
          <ul className="divide-y divide-ink/10">
            {messages.map((m) => (
              <li key={m.id} className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium text-ink">{m.name}</span>
                    <span className="font-mono text-[11px] text-ink/40">{m.email}</span>
                    {!m.is_read && (
                      <span className="rounded-full bg-accent/20 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide text-ink">
                        new
                      </span>
                    )}
                  </div>
                  {m.subject && <p className="mt-1 text-sm font-medium text-ink/80">{m.subject}</p>}
                  <p className="mt-1 font-mono text-[11px] text-ink/40">
                    {m.created_at ? format(new Date(m.created_at), 'MMM d, yyyy p') : ''}
                  </p>
                  <p className="mt-2 whitespace-pre-wrap text-sm text-ink/75">{m.message}</p>
                </div>
                {!m.is_read && (
                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      type="button"
                      disabled={busyIds[m.id]}
                      onClick={() => handleMarkRead(m)}
                      className="flex items-center gap-1.5 rounded-full bg-ink px-3.5 py-2 font-mono text-xs text-cream disabled:opacity-50"
                    >
                      <MailOpen size={13} /> Mark read
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}
