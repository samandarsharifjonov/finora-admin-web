import React from 'react'
import { X, Download, ExternalLink } from 'lucide-react'

interface ImagePreviewModalProps {
  imageUrl: string | null
  onClose: () => void
}

export const ImagePreviewModal: React.FC<ImagePreviewModalProps> = ({ imageUrl, onClose }) => {
  if (!imageUrl) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="relative max-h-[90vh] max-w-[90vw] overflow-hidden rounded-2xl bg-slate-900 shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Top toolbar */}
        <div className="absolute top-0 inset-x-0 z-10 flex items-center justify-between bg-gradient-to-b from-black/60 to-transparent p-4 text-white">
          <span className="text-xs font-semibold drop-shadow">Rasm ko'rinishi</span>
          <div className="flex items-center gap-2">
            <a
              href={imageUrl}
              target="_blank"
              rel="noreferrer"
              download
              className="rounded-lg bg-black/40 p-2 text-white/90 hover:bg-black/60 transition-colors"
              title="Yuklab olish"
            >
              <Download className="h-4 w-4" />
            </a>
            <a
              href={imageUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded-lg bg-black/40 p-2 text-white/90 hover:bg-black/60 transition-colors"
              title="Yangi oynada ochish"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
            <button
              onClick={onClose}
              className="rounded-lg bg-black/40 p-2 text-white/90 hover:bg-black/60 transition-colors"
              title="Yopish"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Full Image */}
        <img
          src={imageUrl}
          alt="Chat rasm"
          className="max-h-[85vh] max-w-full object-contain rounded-2xl select-none"
        />
      </div>
    </div>
  )
}
