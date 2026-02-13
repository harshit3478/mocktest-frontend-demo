'use client'

import React from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import QuestionRow from '@/components/QuestionRow'
import type { Question } from '@/lib/types'

interface QuestionListProps {
  questions: Question[]
  selectedIds: Set<number>
  onReorder: (questions: Question[]) => void
  onUpdate: (id: number, updated: Question) => void
  onDelete: (id: number) => void
  onSelect: (id: number, selected: boolean) => void
}

/**
 * Drag-and-drop question list container
 * Handles reordering via @dnd-kit
 */
export default function QuestionList({
  questions,
  selectedIds,
  onReorder,
  onUpdate,
  onDelete,
  onSelect,
}: QuestionListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = questions.findIndex(q => q.id === active.id)
      const newIndex = questions.findIndex(q => q.id === over.id)

      const reordered = arrayMove(questions, oldIndex, newIndex)
      onReorder(reordered)
    }
  }

  if (questions.length === 0) {
    return (
      <div className="text-center py-12 text-neutral-500">
        No questions loaded. Upload a PDF to get started.
      </div>
    )
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={questions.map(q => q.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-4">
          {questions.map((question) => (
            <QuestionRow
              key={question.id}
              question={question}
              isSelected={selectedIds.has(question.id)}
              onUpdate={(updated) => onUpdate(question.id, updated)}
              onDelete={() => onDelete(question.id)}
              onSelect={(selected) => onSelect(question.id, selected)}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}
