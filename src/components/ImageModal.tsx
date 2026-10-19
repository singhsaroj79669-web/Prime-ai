import React from 'react';
import { X, Download } from 'lucide-react';

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  altText?: string;
}

export const ImageModal: React.FC<ImageModalProps> = ({
  isOpen,
  onClose,
  imageUrl,
  altText = 'Uploaded image',
}) => {
  if (!isOpen || !imageUrl) return null;

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `primexzerox-image-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative max-w-4xl max-h-[90vh] bg-slate-900 border border-slate-700/80 rounded-2xl overflow-hidden shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900/90 text-slate-300">
          <span className="text-xs font-mono uppercase tracking-wider text-cyan-400">
            Image Preview • PrimeXzerox Vision
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              title="Download Image"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="p-3 flex items-center justify-center overflow-auto max-h-[calc(90vh-60px)]">
          <img
            src={imageUrl}
            alt={altText}
            className="max-h-[80vh] w-auto max-w-full rounded-lg object-contain shadow-lg"
          />
        </div>
      </div>
    </div>
  );
};
