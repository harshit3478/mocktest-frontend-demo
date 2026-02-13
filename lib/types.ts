/**
 * Frontend types matching the backend schema
 */

export interface Option {
  id: string         // A, B, C, D...
  text: string
  is_correct: boolean
}

export interface Solution {
  text: string
  missing: boolean
}

export interface QualityFlags {
  has_math: boolean
  confidence: 'low' | 'medium' | 'high'
  needs_review: boolean
  notes: string[]
}

export interface Question {
  id: number
  question_text: string
  question_type: 'single_correct' | 'multiple_correct' | 'numerical' | 'passage_based'
  question_images?: string[] // Optional array of image URLs
  options: Option[]
  correct_answer: string | null
  solution: Solution
  quality_flags: QualityFlags
}

export interface ExamMeta {
  source_file: string
  generated_at: string
  pdf_format_detected: string
  total_questions: number
  processing_notes: string[]
}

export interface ValidationSummary {
  total_flagged: number
  missing_solutions: number
  low_confidence: number
}

export interface ExamPaper {
  exam_meta: ExamMeta
  questions: Question[]
  validation_summary: ValidationSummary
}
