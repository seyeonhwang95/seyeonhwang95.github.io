/**
 * Utility functions for key signature handling
 */

import type { KeySignature } from '../types/musicTypes'

// Mapping of sharp/flat count to key names
const MAJOR_KEYS = [
  'C', 'G', 'D', 'A', 'E', 'B', 'F#', 'C#', // sharps
  'F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb', 'Cb', // flats
]

const MINOR_KEYS = [
  'A', 'E', 'B', 'F#', 'C#', 'G#', 'D#', 'A#', // sharps
  'D', 'G', 'C', 'F', 'Bb', 'Eb', 'Ab', // flats
]

/**
 * Get key name from sharps/flats count
 */
export const getKeyName = (keySignature: KeySignature): string => {
  const keyArray = keySignature.isMinor ? MINOR_KEYS : MAJOR_KEYS
  let index: number

  if (keySignature.sharpsFlats >= 0) {
    // Sharps: index is the count
    index = keySignature.sharpsFlats
  } else {
    // Flats: index is 8 + count (since we go from 8 backwards)
    index = 8 + keySignature.sharpsFlats
  }

  return keyArray[Math.max(0, Math.min(index, keyArray.length - 1))] || 'C'
}

/**
 * Get key signature from key name
 */
export const getKeySignature = (keyName: string, isMinor: boolean = false): KeySignature => {
  const keyArray = isMinor ? MINOR_KEYS : MAJOR_KEYS
  const index = keyArray.indexOf(keyName)

  if (index === -1) {
    return { sharpsFlats: 0, isMinor }
  }

  // Convert index to sharps/flats
  let sharpsFlats = 0
  if (index < 8) {
    // Sharps
    sharpsFlats = index
  } else {
    // Flats
    sharpsFlats = index - 8
  }

  return { sharpsFlats, isMinor }
}

/**
 * Get all available keys
 */
export const getAllKeys = (): Array<{ name: string; isMajor: boolean; keySignature: KeySignature }> => {
  const keys: Array<{ name: string; isMajor: boolean; keySignature: KeySignature }> = []

  MAJOR_KEYS.forEach((key) => {
    keys.push({
      name: key + ' Major',
      isMajor: true,
      keySignature: getKeySignature(key, false),
    })
  })

  MINOR_KEYS.forEach((key) => {
    keys.push({
      name: key + ' Minor',
      isMajor: false,
      keySignature: getKeySignature(key, true),
    })
  })

  return keys
}

/**
 * Render key signature as SVG accidentals
 */
export const renderKeySignatureAccidentals = (
  keySignature: KeySignature,
  startX: number,
  staffTopY: number,
  staffLineHeight: number,
): Array<{ x: number; y: number; symbol: string; type: 'sharp' | 'flat' }> => {
  const accidentals: Array<{ x: number; y: number; symbol: string; type: 'sharp' | 'flat' }> = []

  const staffLineGap = staffLineHeight * 2
  const staffMiddleLineY = staffTopY + staffLineGap * 2

  if (keySignature.sharpsFlats > 0) {
    // Sharps
    const sharpPositions = [
      staffMiddleLineY + staffLineGap, // F#
      staffMiddleLineY + staffLineGap * 2, // C#
      staffMiddleLineY - staffLineGap, // G#
      staffMiddleLineY + staffLineHeight, // D#
      staffMiddleLineY - staffLineGap * 2, // A#
      staffMiddleLineY, // E#
      staffMiddleLineY - staffLineGap * 2 - staffLineHeight, // B#
    ]

    for (let i = 0; i < Math.min(keySignature.sharpsFlats, sharpPositions.length); i++) {
      accidentals.push({
        x: startX + i * 20,
        y: sharpPositions[i],
        symbol: '♯',
        type: 'sharp',
      })
    }
  } else if (keySignature.sharpsFlats < 0) {
    // Flats
    const flatPositions = [
      staffMiddleLineY, // Bb
      staffMiddleLineY - staffLineGap, // Eb
      staffMiddleLineY + staffLineGap, // Ab
      staffMiddleLineY - staffLineHeight, // Db
      staffMiddleLineY + staffLineGap * 2, // Gb
      staffMiddleLineY - staffLineGap * 2, // Cb
      staffMiddleLineY + staffLineHeight, // Fb
    ]

    for (let i = 0; i < Math.min(-keySignature.sharpsFlats, flatPositions.length); i++) {
      accidentals.push({
        x: startX + i * 20,
        y: flatPositions[i],
        symbol: '♭',
        type: 'flat',
      })
    }
  }

  return accidentals
}
