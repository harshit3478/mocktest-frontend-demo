'use client'

import React from 'react'
import 'katex/dist/katex.min.css'
import { InlineMath, BlockMath } from 'react-katex'

interface MathPreviewProps {
  content: string
  className?: string
}

/**
 * Renders text with inline LaTeX math
 * Detects $...$ for inline math and $$...$$ for display math
 */
export default function MathPreview({ content, className = '' }: MathPreviewProps) {
  const renderContent = () => {
    if (!content) return null

    const parts: React.ReactNode[] = []
    let lastIndex = 0

    // Match both inline ($...$) and display ($$...$$) math
    // Display math takes precedence (checked first)
    const mathRegex = /(\$\$[\s\S]+?\$\$|\$[^$]+?\$)/g

    let match
    while ((match = mathRegex.exec(content)) !== null) {
      // Add text before math
      if (match.index > lastIndex) {
        parts.push(content.substring(lastIndex, match.index))
      }

      const mathContent = match[0]

      // Check if it's display or inline math
      if (mathContent.startsWith('$$')) {
        // Display math
        const formula = mathContent.slice(2, -2).trim()
        parts.push(
          <BlockMath key={match.index} math={formula} />
        )
      } else {
        // Inline math
        const formula = mathContent.slice(1, -1).trim()
        parts.push(
          <InlineMath key={match.index} math={formula} />
        )
      }

      lastIndex = match.index + mathContent.length
    }

    // Add remaining text
    if (lastIndex < content.length) {
      parts.push(content.substring(lastIndex))
    }

    return parts.length > 0 ? parts : content
  }

  return (
    <div className={`math-preview ${className}`}>
      {renderContent()}
    </div>
  )
}
