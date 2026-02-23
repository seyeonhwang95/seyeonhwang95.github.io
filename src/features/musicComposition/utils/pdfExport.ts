/**
 * Utility for exporting music scores to PDF
 */

import type { Score } from '../types/musicTypes'
import { scoreToMusicXML } from './scoreUtils'

/**
 * Export score as PDF by capturing the score sheet DOM
 * Requires html2canvas and jspdf to be installed
 */
export const exportScoreToPDF = async (
  scoreElement: HTMLElement | null,
  score: Score,
): Promise<void> => {
  if (!scoreElement) {
    throw new Error('Score element not found')
  }

  try {
    // Dynamic imports to keep bundle size small when not needed
    const html2canvas = (await import('html2canvas')).default
    const jsPDF = (await import('jspdf')).jsPDF

    // Capture the score canvas
    const canvas = await html2canvas(scoreElement, {
      allowTaint: true,
      useCORS: true,
      backgroundColor: '#ffffff',
      scale: 2, // Higher quality
    })

    // Get PDF dimensions (A4 portrait)
    const pdfWidth = 210 // mm

    // Calculate scale to fit the canvas
    const imgWidth = pdfWidth
    const imgHeight = (canvas.height * pdfWidth) / canvas.width

    // Create PDF document
    const pdf = new jsPDF({
      orientation: imgHeight > pdfWidth ? 'portrait' : 'landscape',
      unit: 'mm',
      format: 'a4',
    })

    const pageHeight = pdf.internal.pageSize.getHeight()
    const pageWidth = pdf.internal.pageSize.getWidth()
    const margin = 10
    const availableHeight = pageHeight - 2 * margin
    const availableWidth = pageWidth - 2 * margin

    // Calculate image dimensions to fit page
    let finalImageWidth = availableWidth
    let finalImageHeight = (availableWidth * imgHeight) / imgWidth

    let yPosition = margin
    let imageData = canvas.toDataURL('image/png')

    // Handle multiple pages if needed
    if (finalImageHeight > availableHeight) {
      // Split image across multiple pages
      const numPages = Math.ceil(finalImageHeight / availableHeight)
      const canvasChunkHeight = canvas.height / numPages

      for (let i = 0; i < numPages; i++) {
        if (i > 0) {
          pdf.addPage()
          yPosition = margin
        }

        // Create temporary canvas for this chunk
        const tempCanvas = document.createElement('canvas')
        tempCanvas.width = canvas.width
        tempCanvas.height = canvasChunkHeight
        const ctx = tempCanvas.getContext('2d')
        if (ctx) {
          ctx.drawImage(
            canvas,
            0,
            i * canvasChunkHeight,
            canvas.width,
            canvasChunkHeight,
            0,
            0,
            canvas.width,
            canvasChunkHeight,
          )
        }

        const chunkImageData = tempCanvas.toDataURL('image/png')
        const chunkHeight = (finalImageHeight / numPages) * 0.95 // Leave small gap
        pdf.addImage(chunkImageData, 'PNG', margin, yPosition, availableWidth, chunkHeight)
      }
    } else {
      pdf.addImage(imageData, 'PNG', margin, yPosition, finalImageWidth, finalImageHeight)
    }

    // Generate filename
    const fileName = `${score.title || 'Score'}_${new Date().toISOString().split('T')[0]}.pdf`

    // Download PDF
    pdf.save(fileName)
  } catch (error) {
    console.error('Error exporting to PDF:', error)
    throw new Error(`Failed to export PDF: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Export score as MusicXML
 */
export const exportScoreAsXML = (score: Score): void => {
  try {
    const xml = scoreToMusicXML(score)
    const blob = new Blob([xml], { type: 'application/xml' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${score.title || 'Score'}_${new Date().toISOString().split('T')[0]}.xml`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Error exporting to XML:', error)
    throw new Error(`Failed to export XML: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}
