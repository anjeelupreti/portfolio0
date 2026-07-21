import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { getSiteWidgets } from '../../api/resources'

// Strips everything except digits so the wa.me link is well-formed
// regardless of how the number was entered (+, spaces, dashes, etc).
export function buildWhatsAppUrl(number, message) {
  const digitsOnly = (number || '').replace(/[^\d]/g, '')
  const text = encodeURIComponent(message || '')
  return `https://wa.me/${digitsOnly}${text ? `?text=${text}` : ''}`
}

// Floating "Chat on WhatsApp" button for the public site. Fails open/silent
// if the widget config can't be fetched or is disabled — never blocks or
// breaks the rest of the page.
export default function WhatsAppButton() {
  const [widget, setWidget] = useState(null)

  useEffect(() => {
    let cancelled = false
    getSiteWidgets()
      .then((data) => {
        if (!cancelled) setWidget(data)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  if (!widget || !widget.whatsapp_enabled || !widget.whatsapp_number) return null

  const handleClick = () => {
    const url = buildWhatsAppUrl(widget.whatsapp_number, widget.whatsapp_default_message)
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <motion.button
      type="button"
      onClick={handleClick}
      aria-label="Chat on WhatsApp"
      title="Chat on WhatsApp"
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ scale: 1.08, y: -3 }}
      whileTap={{ scale: 0.96 }}
      className="fixed bottom-24 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-lg shadow-black/20 sm:bottom-6 sm:right-6"
      style={{ backgroundColor: '#25D366' }}
    >
      <svg viewBox="0 0 32 32" width="28" height="28" fill="white" aria-hidden="true">
        <path d="M16.001 3C9.098 3 3.5 8.598 3.5 15.5c0 2.31.63 4.474 1.727 6.33L3 29l7.36-2.184A12.44 12.44 0 0 0 16.001 28C22.903 28 28.5 22.402 28.5 15.5S22.903 3 16.001 3Zm0 22.75a10.2 10.2 0 0 1-5.207-1.427l-.373-.222-4.367 1.296 1.317-4.256-.243-.39A10.19 10.19 0 0 1 5.75 15.5c0-5.66 4.591-10.25 10.251-10.25 5.659 0 10.25 4.59 10.25 10.25 0 5.66-4.591 10.25-10.25 10.25Zm5.633-7.674c-.309-.155-1.828-.902-2.111-1.005-.283-.103-.489-.155-.695.155-.206.31-.797 1.005-.977 1.211-.18.206-.36.232-.668.077-.309-.155-1.303-.48-2.482-1.53-.917-.818-1.536-1.828-1.716-2.137-.18-.31-.019-.477.136-.63.14-.14.309-.361.464-.542.155-.18.206-.31.309-.516.103-.206.051-.387-.026-.542-.077-.155-.695-1.675-.953-2.294-.251-.603-.506-.522-.695-.532l-.593-.01c-.206 0-.542.077-.825.387-.283.31-1.08 1.056-1.08 2.576s1.106 2.988 1.26 3.194c.155.206 2.177 3.324 5.276 4.66.737.318 1.312.508 1.76.65.739.235 1.412.202 1.944.123.593-.089 1.828-.747 2.086-1.469.258-.722.258-1.34.18-1.469-.077-.129-.283-.206-.592-.361Z" />
      </svg>
    </motion.button>
  )
}
