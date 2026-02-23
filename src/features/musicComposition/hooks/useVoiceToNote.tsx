import { useState, useEffect, useRef, useCallback } from 'react';

/** 
 * Hook for voice-to-note detection using native browser APIs
 */
interface VoiceToNoteHook {
  startRecording: () => void;
  stopRecording: () => void;
  togglePauseResume: () => void;
  isRecording: boolean;
  isPaused: boolean;
  detectedNote: string | null;
  recordingTime: number;
}

export const useVoiceToNote = (): VoiceToNoteHook => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [detectedNote, setDetectedNote] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const isRecordingRef = useRef<boolean>(false);

  const startRecording = useCallback(async () => {
    try {
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: false,
        } 
      });
      streamRef.current = stream;

      // Create audio context
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const audioContext = new AudioContextClass();
      audioContextRef.current = audioContext;

      // Create analyser node
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 2048;
      analyser.smoothingTimeConstant = 0.8;
      analyserRef.current = analyser;

      // Connect microphone to analyser
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);

      setIsRecording(true);
      setIsPaused(false);
      isRecordingRef.current = true;
      startTimeRef.current = Date.now();

      console.log('Recording started, sample rate:', audioContext.sampleRate);

      // Start pitch detection loop
      const detectLoop = () => {
        if (!analyserRef.current || !isRecordingRef.current) return;

        const dataArray = new Float32Array(analyserRef.current.fftSize);
        analyserRef.current.getFloatTimeDomainData(dataArray);

        const frequency = detectPitch(dataArray, audioContext.sampleRate);
        
        if (frequency) {
          const note = frequencyToNote(frequency);
          setDetectedNote(note);
        } else {
          setDetectedNote("No pitch detected");
        }

        // Update recording time
        setRecordingTime(Math.floor((Date.now() - startTimeRef.current) / 1000));

        animationFrameRef.current = requestAnimationFrame(detectLoop);
      };

      detectLoop();
    } catch (error) {
      console.error('Error starting recording:', error);
      setDetectedNote("Microphone access denied");
    }
  }, []);

  const stopRecording = useCallback(() => {
    isRecordingRef.current = false;

    // Stop animation loop
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    // Stop media stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    // Close audio context
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    setIsRecording(false);
    setIsPaused(false);
    setDetectedNote(null);
    setRecordingTime(0);
  }, []);

  const togglePauseResume = useCallback(() => {
    setIsPaused(prev => !prev);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Improved autocorrelation algorithm to find fundamental frequency
  const detectPitch = (data: Float32Array, sampleRate: number): number | null => {
    // Calculate RMS energy to filter out silence/noise
    const rms = Math.sqrt(data.reduce((sum, val) => sum + val * val, 0) / data.length);
    const threshold = 0.005; // Lower threshold for more sensitivity
    
    if (rms < threshold) {
      return null; // Signal too weak
    }

    // Human vocal range: ~80Hz (E2) to ~1000Hz (B5)
    const minFreq = 80;
    const maxFreq = 1000;
    const minSamples = Math.floor(sampleRate / maxFreq);
    const maxSamples = Math.floor(sampleRate / minFreq);

    let bestOffset = -1;
    let bestCorrelation = 0;

    // Compute normalized autocorrelation
    for (let offset = minSamples; offset <= maxSamples; offset++) {
      let correlation = 0;
      let normalization = 0;
      
      for (let i = 0; i < data.length - offset; i++) {
        correlation += data[i] * data[i + offset];
        normalization += data[i] * data[i];
      }
      
      // Normalize to get correlation coefficient between -1 and 1
      const normalizedCorrelation = normalization > 0 ? correlation / normalization : 0;
      
      if (normalizedCorrelation > bestCorrelation) {
        bestCorrelation = normalizedCorrelation;
        bestOffset = offset;
      }
    }

    // Lower correlation threshold for more detections
    if (bestCorrelation > 0.3 && bestOffset !== -1) {
      const frequency = sampleRate / bestOffset;
      console.log(`Detected: ${frequency.toFixed(1)}Hz, correlation: ${bestCorrelation.toFixed(2)}, RMS: ${rms.toFixed(4)}`);
      return frequency;
    }
    
    return null;
  };

  const frequencyToNote = (freq: number): string => {
    const notes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
    const semitones = 12 * (Math.log2(freq / 440)) + 69;
    const noteIndex = Math.round(semitones) % 12;
    const octave = Math.floor(Math.round(semitones) / 12) - 1;
    return `${notes[noteIndex]}${octave}`;
  };

  return { 
    startRecording, 
    stopRecording, 
    togglePauseResume, 
    isRecording, 
    isPaused,
    detectedNote,
    recordingTime
  };
};