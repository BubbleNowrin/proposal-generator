'use client'

interface ProposalPreviewProps {
  proposal: string
  onRegenerate: () => void
  onCopy: () => void
  onEdit: (newText: string) => void
}

export default function ProposalPreview({ proposal, onRegenerate, onCopy, onEdit }: ProposalPreviewProps) {
  return (
    <div className="border rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h4 className="font-medium text-gray-800">📝 Your Proposal</h4>
        <div className="flex gap-2">
          <button
            onClick={onRegenerate}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            🔄 Regenerate
          </button>
          <button
            onClick={onCopy}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-600 transition-colors"
          >
            📋 Copy
          </button>
        </div>
      </div>
      
      <div className="bg-gray-50 p-4 rounded-lg">
        <textarea
          value={proposal}
          onChange={(e) => onEdit(e.target.value)}
          className="w-full h-64 p-3 border border-gray-300 rounded-lg resize-none font-sans text-gray-700 leading-relaxed"
          placeholder="Your proposal will appear here..."
        />
      </div>
      
      <div className="mt-3 flex items-center text-sm text-gray-600">
        <span>💡 Tip: You can edit the proposal above before copying</span>
      </div>
    </div>
  )
}