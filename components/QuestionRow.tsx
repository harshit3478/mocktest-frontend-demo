'use client'

import { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Trash2, Eye, EyeOff } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import OptionEditor from '@/components/OptionEditor'
import SolutionEditor from '@/components/SolutionEditor'
import MathPreview from '@/components/MathPreview'
import type { Question } from '@/lib/types'

interface QuestionRowProps {
  question: Question
  isSelected: boolean
  onUpdate: (question: Question) => void
  onDelete: () => void
  onSelect: (selected: boolean) => void
}

/**
 * Main editable question row with drag-and-drop, inline editing,
 * and modular options (add/delete)
 */
export default function QuestionRow({
  question,
  isSelected,
  onUpdate,
  onDelete,
  onSelect,
}: QuestionRowProps) {
  const [showPreview, setShowPreview] = useState(true)
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: question.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const handleAddOption = () => {
    // Generate next option ID (A, B, C, D, E, F...)
    const nextLetter = String.fromCharCode(65 + question.options.length)
    const newOption = {
      id: nextLetter,
      text: '',
      is_correct: false,
    }
    const updatedOptions = [...question.options, newOption]
    onUpdate({ ...question, options: updatedOptions })
  }

  const handleUpdateOption = (index: number, updatedOption: typeof question.options[0]) => {
    const updatedOptions = [...question.options]
    updatedOptions[index] = updatedOption

    // Update correct_answer if this option is now correct
    const correctAnswer = updatedOption.is_correct ? updatedOption.id : null

    // If marking as correct, unmark others
    if (updatedOption.is_correct) {
      updatedOptions.forEach((opt, i) => {
        if (i !== index) opt.is_correct = false
      })
    }

    onUpdate({
      ...question,
      options: updatedOptions,
      correct_answer: correctAnswer || question.options.find(o => o.is_correct)?.id || null,
    })
  }

  const handleDeleteOption = (index: number) => {
    if (question.options.length <= 2) return // Minimum 2 options

    const updatedOptions = question.options.filter((_, i) => i !== index)

    // Re-generate option IDs (A, B, C...)
    const reindexedOptions = updatedOptions.map((opt, i) => ({
      ...opt,
      id: String.fromCharCode(65 + i),
    }))

    onUpdate({
      ...question,
      options: reindexedOptions,
      correct_answer: reindexedOptions.find(o => o.is_correct)?.id || null,
    })
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`border rounded-lg p-4 bg-white space-y-4 hover:shadow-md transition-shadow ${
        isSelected ? 'ring-2 ring-primary' : ''
      } ${question.quality_flags?.needs_review ? 'border-yellow-400' : ''}`}
    >
      {/* Header row - drag handle, checkbox, question number, delete */}
      <div className="flex items-start gap-3">
        {/* Drag handle */}
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing pt-1"
        >
          <GripVertical className="w-5 h-5 text-neutral-400" />
        </div>

        {/* Selection checkbox */}
        <Checkbox
          checked={isSelected}
          onCheckedChange={onSelect}
          className="mt-1"
        />

        {/* Question number */}
        <div className="w-12 h-8 flex items-center justify-center rounded bg-primary text-primary-foreground font-medium text-sm shrink-0">
          Q{question.id}
        </div>

        {/* Question text input */}
        <div className="flex-1 space-y-2">
          {showPreview ? (
            // Preview mode with LaTeX rendering
            <div 
              className="min-h-10 px-3 py-2 border rounded-md bg-white cursor-pointer hover:bg-gray-50"
              onClick={() => setShowPreview(false)}
            >
              <MathPreview content={question.question_text} />
            </div>
          ) : (
            // Edit mode
            <Input
              value={question.question_text}
              onChange={(e) => {
                onUpdate({ ...question, question_text: e.target.value })
              }}
              onBlur={() => setShowPreview(true)}
              placeholder="Question text..."
              autoFocus
            />
          )}
             {/* Images */}
             {question.question_images && question.question_images.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {question.question_images.map((img, idx) => {
                    // Handle both full URLs and relative paths
                    const imgSrc = img.startsWith('http') ? img : `http://localhost:8000/static/${img}`
                    return (
                      <div key={idx} className="border p-1 rounded bg-neutral-50">
                         <img 
                           src={imgSrc} 
                           alt={`Question image ${idx + 1}`}
                           className="max-h-40 max-w-full object-contain"
                         />
                      </div>
                    )
                  })}
                </div>
             )}
        </div>

        {/* Preview toggle button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowPreview(!showPreview)}
          className="shrink-0"
          title={showPreview ? "Edit" : "Preview"}
        >
          {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </Button>

        {/* Delete button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onDelete}
          className="shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10"
          title="Delete question"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      {/* Quality flags indicator */}
      {question.quality_flags?.needs_review && (
        <div className="text-xs text-yellow-600 bg-yellow-50 px-3 py-2 rounded border border-yellow-200">
          ⚠️ Needs Review: {question.quality_flags.notes.join(', ')}
        </div>
      )}

      {/* Options */}
      <div className="space-y-2 pl-20">
        <div className="text-sm font-medium text-neutral-700 mb-2">Options:</div>
        {question.options.map((option, index) => (
          <OptionEditor
            key={option.id}
            option={option}
            canDelete={question.options.length > 2}
            onUpdate={(updatedOption) => handleUpdateOption(index, updatedOption)}
            onDelete={() => handleDeleteOption(index)}
          />
        ))}

        {/* Add option button */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleAddOption}
          className="mt-2"
        >
          + Add Option
        </Button>
      </div>

      {/* Solution */}
      <div className="pl-20">
        <SolutionEditor
          solution={question.solution}
          onUpdate={(updatedSolution) => {
            onUpdate({ ...question, solution: updatedSolution })
          }}
        />
      </div>
    </div>
  )
}
