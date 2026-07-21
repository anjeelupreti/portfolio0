import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import {
  LucideLoader2 as Loader2,
  LucideMail as Mail,
  LucideMailOpen as MailOpen,
  LucideReply as Reply,
  LucideSend as Send,
  LucideX as X,
  LucideCornerDownRight as CornerDownRight,
  LucideAlertTriangle as AlertTriangle,
} from 'lucide-react'
import SectionEyebrow from '../../components/ui/SectionEyebrow'
import Card from '../components/Card'
import RichTextEditor from '../components/RichTextEditor'
import { getContactMessages, markContactMessageRead, sendEmail } from '../api/adminResources'
import { useToast } from '../components/Toast'

function ReplyThread({ replies }) {
  if (!replies || replies.length === 0) return null

  return (
    <div className="mt-3 space-y-3 border-l-2 border-ink/10 pl-4">
      {replies.map((r) => (
        <div key={r.id} className="rounded-lg bg-ink/[0.03] p-3">
          <div className="flex flex-wrap items-center gap-2">
            <CornerDownRight size={13} className="text-ink/30" />
            <span className="font-mono text-[11px] text-ink/50">
              {r.sender_username || 'you'}
            </span>
            <span className="font-mono text-[11px] text-ink/30">
              {r.sent_at ? format(new Date(r.sent_at), 'MMM d, yyyy p') : ''}
            </span>
            {r.send_error && (
              <span className="flex items-center gap-1 rounded-full bg-red-500/10 px-2 py-0.5 font-mono text-[10px] text-red-500">
                <AlertTriangle size={10} /> send failed
              </span>
            )}
          </div>
          {r.subject && <p className="mt-1.5 text-sm font-medium text-ink/80">{r.subject}</p>}
          <div
            className="prose prose-sm prose-neutral mt-1 max-w-none text-ink/70 prose-p:text-ink/70 prose-a:text-ink"
            dangerouslySetInnerHTML={{ __html: r.body_html }}
          />
          {r.send_error && (
            <p className="mt-2 font-mono text-[10px] text-red-500/80">{r.send_error}</p>
          )}
        </div>
      ))}
    </div>
  )
}

function ReplyForm({ message, onSent, onCancel }) {
  const { push } = useToast()
  const [subject, setSubject] = useState(`Re: ${message.subject || 'your message'}`)
  const [body, setBody] = useState('')
  const [sending, setSending] = useState(false)

  const handleSend = async () => {
    if (!body.trim()) {
      push('Reply body is required.', 'error')
      return
    }
    setSending(true)
    try {
      const { data, ok } = await sendEmail({
        contact_message: message.id,
        to_email: message.email,
        subject,
        body_html: body,
      })
      if (ok) {
        push('Reply sent.', 'success')
      } else {
        push(data.send_error ? `Reply saved, but sending failed: ${data.send_error}` : 'Failed to send reply.', 'error')
      }
      onSent()
    } catch {
      push('Failed to send reply.', 'error')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="mt-4 rounded-xl border border-ink/10 bg-ink/[0.02] p-4">
      <div className="mb-3 rounded-lg bg-white/60 p-3">
        <p className="font-mono text-[11px] text-ink/40">
          Replying to: {message.name} &lt;{message.email}&gt;
        </p>
        {message.subject && <p className="mt-1 text-sm font-medium text-ink/70">{message.subject}</p>}
        <p className="mt-1 whitespace-pre-wrap text-xs text-ink/50">{message.message}</p>
      </div>

      <label className="mb-1.5 block font-mono text-xs text-ink/50">subject</label>
      <input
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        className="mb-3 w-full rounded-lg border border-ink/15 bg-white px-3.5 py-2.5 text-sm text-ink focus:border-ink focus:outline-none"
      />

      <label className="mb-1.5 block font-mono text-xs text-ink/50">body</label>
      <RichTextEditor value={body} onChange={setBody} />

      <div className="mt-3 flex items-center gap-2">
        <button
          type="button"
          disabled={sending}
          onClick={handleSend}
          className="flex items-center gap-2 rounded-full bg-ink px-4 py-2.5 font-mono text-xs text-cream disabled:opacity-50"
        >
          {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
          Send reply
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex items-center gap-2 rounded-full border border-ink/15 px-4 py-2.5 font-mono text-xs text-ink/60"
        >
          <X size={14} /> Cancel
        </button>
      </div>
    </div>
  )
}

export default function Messages() {
  const { push } = useToast()
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [busyIds, setBusyIds] = useState({})
  const [replyingId, setReplyingId] = useState(null)

  const loadMessages = () =>
    getContactMessages()
      .then(setMessages)
      .catch(() => push('Failed to load messages.', 'error'))

  useEffect(() => {
    loadMessages().finally(() => setLoading(false))
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

  const handleReplySent = (messageId) => {
    setReplyingId(null)
    loadMessages()
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
              <li key={m.id} className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
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
                  <div className="flex shrink-0 items-center gap-2">
                    {!m.is_read && (
                      <button
                        type="button"
                        disabled={busyIds[m.id]}
                        onClick={() => handleMarkRead(m)}
                        className="flex items-center gap-1.5 rounded-full bg-ink px-3.5 py-2 font-mono text-xs text-cream disabled:opacity-50"
                      >
                        <MailOpen size={13} /> Mark read
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setReplyingId(replyingId === m.id ? null : m.id)}
                      className="flex items-center gap-1.5 rounded-full border border-ink/15 px-3.5 py-2 font-mono text-xs text-ink/70 hover:border-ink"
                    >
                      <Reply size={13} /> Reply
                    </button>
                  </div>
                </div>

                <ReplyThread replies={m.replies} />

                {replyingId === m.id && (
                  <ReplyForm
                    message={m}
                    onSent={() => handleReplySent(m.id)}
                    onCancel={() => setReplyingId(null)}
                  />
                )}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}
