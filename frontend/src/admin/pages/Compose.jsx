import { useState } from 'react'
import {
  LucideLoader2 as Loader2,
  LucideSend as Send,
  LucideEye as Eye,
  LucideX as X,
} from 'lucide-react'
import SectionEyebrow from '../../components/ui/SectionEyebrow'
import Card from '../components/Card'
import RichTextEditor from '../components/RichTextEditor'
import { useToast } from '../components/Toast'
import { sendEmail } from '../api/adminResources'

const emptyForm = { to_email: '', subject: '', body_html: '' }

/** Standalone email composer for sending a message not tied to any existing contact submission. */
export default function Compose() {
  const { push } = useToast()
  const [form, setForm] = useState(emptyForm)
  const [sending, setSending] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
  }

  const handleSend = async () => {
    if (!form.to_email.trim()) {
      push('Recipient email is required.', 'error')
      return
    }
    if (!form.subject.trim()) {
      push('Subject is required.', 'error')
      return
    }
    if (!form.body_html.trim()) {
      push('Email body is required.', 'error')
      return
    }
    setSending(true)
    try {
      const { data, ok } = await sendEmail({
        contact_message: null,
        to_email: form.to_email,
        subject: form.subject,
        body_html: form.body_html,
      })
      if (ok) {
        push('Email sent.', 'success')
        setForm(emptyForm)
      } else {
        push(data.send_error ? `Send failed: ${data.send_error}` : 'Failed to send email.', 'error')
      }
    } catch {
      push('Failed to send email.', 'error')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <SectionEyebrow>Compose</SectionEyebrow>
          <h1 className="mt-3 font-display text-2xl font-bold text-ink">New Email</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setShowPreview(true)}
            className="flex items-center gap-2 rounded-full border border-ink/20 px-4 py-2.5 text-sm font-semibold text-ink/70 hover:border-ink"
          >
            <Eye size={15} /> Preview
          </button>
          <button
            type="button"
            disabled={sending}
            onClick={handleSend}
            className="flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-cream transition-transform hover:scale-105 disabled:opacity-50"
          >
            {sending ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
            Send
          </button>
        </div>
      </div>

      <Card title="compose.email">
        <label className="mb-1.5 block font-mono text-xs text-ink/50">to</label>
        <input
          name="to_email"
          type="email"
          value={form.to_email}
          onChange={handleChange}
          placeholder="someone@example.com"
          className="w-full rounded-lg border border-ink/15 bg-surface px-3.5 py-2.5 text-sm text-ink focus:border-ink focus:outline-none"
        />

        <label className="mb-1.5 mt-4 block font-mono text-xs text-ink/50">subject</label>
        <input
          name="subject"
          value={form.subject}
          onChange={handleChange}
          className="w-full rounded-lg border border-ink/15 bg-surface px-3.5 py-2.5 text-sm text-ink focus:border-ink focus:outline-none"
        />

        <label className="mb-1.5 mt-4 block font-mono text-xs text-ink/50">body</label>
        <RichTextEditor
          value={form.body_html}
          onChange={(html) => setForm((f) => ({ ...f, body_html: html }))}
        />
      </Card>

      {showPreview && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 p-4">
          <div className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-cream shadow-2xl">
            <div className="sticky top-0 flex items-center justify-between border-b border-ink/10 bg-cream px-6 py-4">
              <span className="font-mono text-xs text-ink/40">preview.html</span>
              <button type="button" onClick={() => setShowPreview(false)} className="text-ink/50 hover:text-ink">
                <X size={20} />
              </button>
            </div>
            <div className="px-6 py-8 sm:px-10">
              <p className="font-mono text-[11px] text-ink/40">to: {form.to_email || '—'}</p>
              <h2 className="mt-2 font-display text-xl font-bold text-ink">{form.subject || 'No subject'}</h2>
              <div
                className="prose prose-neutral mt-6 max-w-none rounded-xl border border-ink/10 p-4 prose-headings:font-display prose-headings:text-ink prose-p:text-ink/75 prose-a:text-ink prose-a:underline prose-strong:text-ink"
                dangerouslySetInnerHTML={{ __html: form.body_html || '<p class="text-ink/40">No content yet.</p>' }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
