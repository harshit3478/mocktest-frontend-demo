'use client'

import React, { useState } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { ChevronDown, ChevronRight, Eye, EyeOff } from 'lucide-react'
import MathPreview from '@/components/MathPreview'
import type { Solution } from '@/lib/types'

interface SolutionEditorProps {
  solution: Solution
  onUpdate: (solution: Solution) => void
}

/**
 * Expandable solution editor with LaTeX preview toggle
 */
export default function SolutionEditor({ solution, onUpdate }: SolutionEditorProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  return (
    <div className="border rounded-md overflow-hidden">
      {/* Header - clickable to expand/collapse */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-4 py-2 bg-neutral-50 hover:bg-neutral-100 transition-colors text-left"
      >
        <div className="flex items-center gap-2">
          {isExpanded ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
          <span className="text-sm font-medium">
            Solution{solution.missing && ' (Missing)'}
          </span>
        </div>

        {isExpanded && (
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              setShowPreview(!showPreview)
            }}
            className="flex items-center gap-1"
          >
            {showPreview ? (
              <>
                <EyeOff className="w-4 h-4" />
                <span className="text-xs">Edit</span>
              </>
            ) : (
              <>
                <Eye className="w-4 h-4" />
                <span className="text-xs">Preview</span>
              </>
            )}
          </Button>
        )}
      </button>

      {/* Content - shown when expanded */}
      {isExpanded && (
        <div className="p-4 space-y-2">
          {showPreview ? (
            // LaTeX preview mode
            <div className="min-h-25 p-3 border rounded bg-white">
              <MathPreview content={solution.text} />
            </div>
          ) : (
            // Edit mode
            <Textarea
              value={solution.text}
              onChange={(e) => {
                onUpdate({ ...solution, text: e.target.value, missing: !e.target.value })
              }}
              placeholder="Enter solution text (supports LaTeX with $...$ for math)..."
              className="min-h-25 font-mono text-sm"
            />
          )}

          {/* Help text */}
          <p className="text-xs text-neutral-500">
            Use $ for inline math: $x^2$ or $$ for display math: $$\\frac{1}{2}$$
          </p>
        </div>
      )}
    </div>
  )
}
