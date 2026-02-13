'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useDropzone } from 'react-dropzone'
import 'katex/dist/katex.min.css'

type ProcessingState = 'idle' | 'processing' | 'error'

export default function Home() {
  const router = useRouter()
  const [state, setState] = useState<ProcessingState>('idle')
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [error, setError] = useState<string>('')

  const processFile = useCallback(async (file: File) => {
    setState('processing')
    setError('')

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('http://localhost:8000/api/process', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Processing failed')
      }

      const result = await response.json()

      if (result.success) {
        // Generate unique ID and save to localStorage
        const examId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        localStorage.setItem(`exam-${examId}`, JSON.stringify(result.data))
        
        // Redirect to editor page
        router.push(`/editor/${examId}`)
      } else {
        throw new Error('Processing failed')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      setState('error')
    }
  }, [router])

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0]
      setUploadedFile(file)
      processFile(file)
    }
  }, [processFile])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    multiple: false,
  })

  const reset = () => {
    setState('idle')
    setUploadedFile(null)
    setError('')
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-medium text-black mb-2">
            PDF to CBT Converter
          </h1>
          <p className="text-sm text-gray-500">
            Convert exam PDFs to structured JSON
          </p>
        </div>

        {/* Main Content */}
        {state === 'idle' && (
          <div
            {...getRootProps()}
            className={`border ${
              isDragActive ? 'border-black bg-gray-50' : 'border-gray-300'
            } p-16 text-center cursor-pointer rounded-lg transition-colors`}
          >
            <input {...getInputProps()} />
            <div className="text-gray-400 mb-4">
              {isDragActive ? 'Drop PDF here' : 'Drop PDF here or click to browse'}
            </div>
            <div className="text-sm text-gray-400">
              Supported format: PDF
            </div>
          </div>
        )}

        {/* Processing State */}
        {state === 'processing' && (
          <div className="border border-gray-200 p-8 rounded-lg">
            <div className="text-center">
              <div className="text-gray-500 mb-2">Processing {uploadedFile?.name}</div>
              <div className="text-sm text-gray-400">Extracting questions...</div>
            </div>
          </div>
        )}

        {/* Error State */}
        {state === 'error' && (
          <div className="border border-gray-200 p-8 rounded-lg">
            <div className="text-center">
              <div className="text-black mb-4">Processing failed</div>
              <div className="text-sm text-red-600 mb-6">{error}</div>
              <button
                onClick={reset}
                className="px-4 py-2 bg-black text-white text-sm rounded hover:bg-gray-800"
              >
                Try Again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
