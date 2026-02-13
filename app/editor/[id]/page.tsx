'use client'

import { useState, useEffect, useTransition } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Download, Trash2, Upload, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import QuestionList from '@/components/QuestionList'
import type { Question, ExamPaper } from '@/lib/types'
import 'katex/dist/katex.min.css'

export default function EditorPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const [, startTransition] = useTransition()

  const [parsedData, setParsedData] = useState<ExamPaper | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [loading, setLoading] = useState(true)

  // Load data from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && id) {
      const stored = localStorage.getItem(`exam-${id}`)
      if (stored) {
        try {
          const data = JSON.parse(stored)
          startTransition(() => {
            setParsedData(data)
            setLoading(false)
          })
        } catch (err) {
          console.error('Failed to parse stored data:', err)
          router.push('/')
        }
      } else {
        // No data found, redirect to home
        router.push('/')
      }
    } else {
      startTransition(() => {
        setLoading(false)
      })
    }
  }, [id, router])

  // Save data to localStorage whenever it changes
  useEffect(() => {
    if (parsedData && id) {
      localStorage.setItem(`exam-${id}`, JSON.stringify(parsedData))
    }
  }, [parsedData, id])

  const downloadJSON = () => {
    if (!parsedData) return

    const blob = new Blob([JSON.stringify(parsedData, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${parsedData.exam_meta.source_file}_parsed.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleReorder = (reorderedQuestions: Question[]) => {
    if (!parsedData) return
    setParsedData({
      ...parsedData,
      questions: reorderedQuestions,
    })
  }

  const handleUpdateQuestion = (id: number, updated: Question) => {
    if (!parsedData) return
    setParsedData({
      ...parsedData,
      questions: parsedData.questions.map(q => q.id === id ? updated : q),
    })
  }

  const handleDeleteQuestion = (id: number) => {
    if (!parsedData) return
    setParsedData({
      ...parsedData,
      questions: parsedData.questions.filter(q => q.id !== id),
      exam_meta: {
        ...parsedData.exam_meta,
        total_questions: parsedData.questions.length - 1,
      },
    })
    setSelectedIds(prev => {
      const newSet = new Set(prev)
      newSet.delete(id)
      return newSet
    })
  }

  const handleSelect = (id: number, selected: boolean) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev)
      if (selected) {
        newSet.add(id)
      } else {
        newSet.delete(id)
      }
      return newSet
    })
  }

  const handleSelectAll = () => {
    if (!parsedData) return
    if (selectedIds.size === parsedData.questions.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(parsedData.questions.map(q => q.id)))
    }
  }

  const handleDeleteSelected = () => {
    if (!parsedData || selectedIds.size === 0) return
    setParsedData({
      ...parsedData,
      questions: parsedData.questions.filter(q => !selectedIds.has(q.id)),
      exam_meta: {
        ...parsedData.exam_meta,
        total_questions: parsedData.questions.length - selectedIds.size,
      },
    })
    setSelectedIds(new Set())
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container max-w-5xl mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="text-gray-500">Loading...</div>
          </div>
        </div>
      </div>
    )
  }

  if (!parsedData) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container max-w-5xl mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="text-black mb-4">No data found</div>
            <Button onClick={() => router.push('/')}>
              Go Home
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/')}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
          </div>
          <h1 className="text-2xl font-medium text-black mb-2">
            Question Editor
          </h1>
          <p className="text-sm text-gray-500">
            {parsedData.exam_meta.source_file}
          </p>
        </div>

        {/* Editor View */}
        <div className="space-y-6">
          {/* Header with stats and actions */}
          <div className="flex justify-between items-center pb-4 border-b">
            <div className="flex items-center gap-6">
              <div className="text-sm">
                <span className="font-medium">{parsedData.questions.length}</span>
                <span className="text-neutral-500 ml-1">questions</span>
              </div>
              {parsedData.validation_summary && parsedData.validation_summary.missing_solutions > 0 && (
                <div className="text-sm">
                  <span className="font-medium text-yellow-600">
                    {parsedData.validation_summary.missing_solutions}
                  </span>
                  <span className="text-neutral-500 ml-1">missing solutions</span>
                </div>
              )}
              {parsedData.validation_summary && parsedData.validation_summary.total_flagged > 0 && (
                <div className="text-sm">
                  <span className="font-medium text-yellow-600">
                    {parsedData.validation_summary.total_flagged}
                  </span>
                  <span className="text-neutral-500 ml-1">need review</span>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/')}
                className="gap-2"
              >
                <Upload className="w-4 h-4" />
                Upload Another
              </Button>
              <Button
                size="sm"
                onClick={downloadJSON}
                className="gap-2"
              >
                <Download className="w-4 h-4" />
                Export JSON
              </Button>
            </div>
          </div>

          {/* Bulk Actions */}
          {parsedData.questions.length > 0 && (
            <div className="flex items-center gap-4 py-3 px-4 bg-neutral-50 rounded-md border">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={selectedIds.size === parsedData.questions.length && parsedData.questions.length > 0}
                  onCheckedChange={handleSelectAll}
                />
                <span className="text-sm text-neutral-600">
                  {selectedIds.size > 0
                    ? `${selectedIds.size} selected`
                    : 'Select all'}
                </span>
              </div>

              {selectedIds.size > 0 && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDeleteSelected}
                  className="gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Selected
                </Button>
              )}
            </div>
          )}

          {/* Question List with Drag & Drop */}
          <QuestionList
            questions={parsedData.questions}
            selectedIds={selectedIds}
            onReorder={handleReorder}
            onUpdate={handleUpdateQuestion}
            onDelete={handleDeleteQuestion}
            onSelect={handleSelect}
          />
        </div>
      </div>
    </div>
  )
}
