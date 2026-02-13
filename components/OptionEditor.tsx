'use client'

import React, { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Trash2 } from 'lucide-react'
import MathPreview from '@/components/MathPreview'
import type { Option } from '@/lib/types'

interface OptionEditorProps {
  option: Option
  canDelete: boolean
  onUpdate: (option: Option) => void
  onDelete: () => void
}

/**
 * Single option editor with inline editing and correct answer checkbox
 * Minimum 2 options required, so delete button disabled if canDelete is false
 */
export default function OptionEditor({
  option,
  canDelete,
  onUpdate,
  onDelete,
}: OptionEditorProps) {
  const [showPreview, setShowPreview] = useState(true)
  
  return (
    <div className="flex items-center gap-2 group">
      {/* Option ID label */}
      <div className="w-8 h-8 flex items-center justify-center rounded bg-neutral-100 text-sm font-medium shrink-0">
        {option.id}
      </div>

      {/* Correct answer checkbox */}
      <Checkbox
        checked={option.is_correct}
        onCheckedChange={(checked) => {
          onUpdate({ ...option, is_correct: checked === true })
        }}
        className="shrink-0"
        title="Mark as correct answer"
      />

      {/* Option text - preview or edit */}
      {showPreview ? (
        <div 
          className="flex-1 min-h-10 px-3 py-2 border rounded-md bg-white cursor-pointer hover:bg-gray-50"
          onClick={() => setShowPreview(false)}
        >
          <MathPreview content={option.text} />
        </div>
      ) : (
        <Input
          value={option.text}
          onChange={(e) => {
            onUpdate({ ...option, text: e.target.value })
          }}
          onBlur={() => setShowPreview(true)}
          className="flex-1"
          placeholder="Option text..."
          autoFocus
        />
      )}

      {/* Delete button (only shown if > 2 options) */}
      {canDelete && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onDelete}
          className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
          title="Delete option"
        >
          <Trash2 className="w-4 h-4 text-destructive" />
        </Button>
      )}
    </div>
  )
}
