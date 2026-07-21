import { LucideExternalLink as ExternalLink } from 'lucide-react'
import Modal from './Modal'

const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif']

/** Extracts a lowercased file extension (e.g. `.pdf`) from a URL, ignoring query/hash. */
function getExtension(url) {
  if (!url) return ''
  const clean = url.split('?')[0].split('#')[0]
  const idx = clean.lastIndexOf('.')
  return idx === -1 ? '' : clean.slice(idx).toLowerCase()
}

/**
 * Preview modal for a Training/Certification's uploaded certificate file.
 * Renders images inline, embeds PDFs via `<iframe>` with an "open in new tab"
 * fallback link, and shows a generic download link for other file types.
 * Built on the shared Modal component.
 */
export default function CertificatePreviewModal({ open, onClose, title, fileUrl }) {
  const ext = getExtension(fileUrl)
  const isImage = IMAGE_EXTENSIONS.includes(ext)
  const isPdf = ext === '.pdf'

  return (
    <Modal open={open} onClose={onClose} title={title || 'certificate.preview'}>
      {!fileUrl ? (
        <p className="py-10 text-center text-sm text-ink/50">No certificate available.</p>
      ) : isImage ? (
        <div className="flex max-h-[70vh] items-center justify-center overflow-hidden rounded-xl bg-ink/[0.03]">
          <img
            src={fileUrl}
            alt={title ? `${title} certificate` : 'Certificate'}
            className="max-h-[70vh] w-full object-contain"
          />
        </div>
      ) : isPdf ? (
        <div className="space-y-3">
          <iframe
            src={fileUrl}
            title={title ? `${title} certificate` : 'Certificate PDF'}
            className="h-[65vh] w-full rounded-xl border border-ink/10"
          />
          <p className="text-center text-xs text-ink/40">
            PDF not displaying correctly?{' '}
            <a
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-semibold text-ink underline underline-offset-2 hover:text-accent"
            >
              Open in new tab <ExternalLink size={12} />
            </a>
          </p>
        </div>
      ) : (
        <div className="py-10 text-center">
          <p className="text-sm text-ink/60">
            This file type can't be previewed inline.
          </p>
          <a
            href={fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-xs font-semibold text-cream hover:scale-105 transition-transform"
          >
            Open file <ExternalLink size={13} />
          </a>
        </div>
      )}
    </Modal>
  )
}
