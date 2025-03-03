'use client'

import { useToastStore } from './use-toast-store'

export function useToastHandlers() {
  const { showToast } = useToastStore()

  const handleCopyToast = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      showToast({
        title: 'Copied to clipboard!',
        description: 'The text has been copied to your clipboard.',
        type: 'success',
      })
    } catch (err) {
      console.error('Failed to copy text: ', err)
      showToast({
        title: 'Copy failed',
        description: 'Failed to copy the text. Please try again.',
        type: 'error',
      })
    }
  }

  const handleAudioToast = {
    onPlay: () => {
      showToast({
        title: 'Listening mode activated',
        description: 'The text is being read aloud.',
        type: 'info',
      })
    },
    onPause: () => {
      showToast({
        title: 'Audio paused',
        description: 'Text-to-speech has been paused.',
        type: 'info',
      })
    },
    onResume: () => {
      showToast({
        title: 'Audio resumed',
        type: 'info',
      })
    },
  }

  const handleFeedbackToast = (type: 'up' | 'down') => {
    showToast({
      title: 'Thank you for your feedback!',
      description: `We appreciate your ${type === 'up' ? 'positive' : 'negative'} feedback.`,
      type: 'success',
    })
  }

  return {
    handleCopyToast,
    handleAudioToast,
    handleFeedbackToast,
  }
}
