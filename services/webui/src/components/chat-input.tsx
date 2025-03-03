'use client'

import * as React from 'react'
import {
  FormEvent,
  useState,
  useRef,
  forwardRef,
  useImperativeHandle,
  ChangeEvent,
} from 'react'
import { Mic, SendHorizontal, Plus, Square } from 'lucide-react'
import { FileChip } from './file-chip'
import { cn } from '@/lib/utils'
import { toast } from '@/components/ui/use-toast'

interface UploadedFile {
  id: string
  file: File
}

interface ChatInputProps extends React.HTMLAttributes<HTMLFormElement> {
  onSend: (userMessage: string) => void
}
export interface ChatInputRef {
  clearInput: () => void
}

export const ChatInput = forwardRef<ChatInputRef, ChatInputProps>(
  ({ className, onSend, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false)
    const [message, setMessage] = useState('')
    const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
    const [isRecording, setIsRecording] = useState(false)
    const [_audioBlob, setAudioBlob] = useState<Blob | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const mediaRecorderRef = useRef<MediaRecorder | null>(null)
    const audioChunksRef = useRef<BlobPart[]>([])
    const inputRef = useRef<HTMLInputElement>(null)

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      if (message.trim()) {
        await onSend(message)
        setMessage('')
      }
    }
    // Expose the clearInput function to the parent component
    useImperativeHandle(ref, () => ({
      clearInput: () => {
        setMessage('')
        if (inputRef.current) {
          inputRef.current.value = ''
        }
        setUploadedFiles([])
      },
    }))

    const handleFileUpload = (event: ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files
      if (files) {
        const newFiles = Array.from(files).map((file) => ({
          id: Math.random().toString(36).substr(2, 9),
          file,
        }))
        setUploadedFiles((prev) => [...prev, ...newFiles])
      }
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }

    const handleRemoveFile = (fileId: string) => {
      setUploadedFiles((prev) => prev.filter((f) => f.id !== fileId))
    }

    const startRecording = async () => {
      try {
        console.log('Requesting microphone permission...')
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        })
        console.log('Permission granted, creating MediaRecorder...')
        const mediaRecorder = new MediaRecorder(stream)
        mediaRecorderRef.current = mediaRecorder
        audioChunksRef.current = []

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data)
          }
        }

        mediaRecorder.onstop = () => {
          console.log('Recording stopped, processing audio...')
          const audioBlob = new Blob(audioChunksRef.current, {
            type: 'audio/wav',
          })
          setAudioBlob(audioBlob)
          const newFile = new File([audioBlob], 'recording.wav', {
            type: 'audio/wav',
          })
          setUploadedFiles((prev) => [
            ...prev,
            { id: Math.random().toString(36).substr(2, 9), file: newFile },
          ])
          console.log('Audio processed and added to uploaded files')
        }

        mediaRecorder.start()
        setIsRecording(true)
        console.log('Recording started')
        toast({
          title: 'Recording started',
          description: "Speak now. Click the stop button when you're done.",
        })
      } catch (error) {
        console.error('Error starting recording:', error)
        toast({
          title: 'Recording failed',
          description:
            "Please make sure you've granted microphone permissions.",
          variant: 'destructive',
        })
      }
    }

    const stopRecording = () => {
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop()
        setIsRecording(false)
        console.log('Recording stopped')
        toast({
          title: 'Recording stopped',
          description: 'Your audio has been added to the chat.',
        })
      }
    }

    return (
      <form
        onSubmit={handleSubmit}
        className={cn('relative w-full max-w-[80%] mx-auto', className)}
        {...props}
      >
        <div
          className={cn(
            'relative flex items-center w-full rounded-full  border bg-white transition-shadow duration-300 ease-in-out',
            isFocused
              ? 'shadow-[0_1px_6px_1px_rgba(32,33,36,0.12),0_3px_8px_2px_rgba(32,33,36,0.14),0_3px_12px_3px_rgba(32,33,36,0.2)]'
              : 'shadow-none'
          )}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileUpload}
            className="hidden"
            id="chat-file-upload"
          />
          <label
            htmlFor="chat-file-upload"
            className={cn(
              'absolute left-2 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full transition-colors border border-gray-300 bg-gray-50',
              'hover:bg-primary/30 focus:bg-gray-100 focus:outline-none'
            )}
          >
            <Plus className="h-5 w-5 text-gray-600" />
            <span className="sr-only">Upload files</span>
          </label>
          <input
            type="text"
            ref={inputRef}
            placeholder="Ask Gemini"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className="h-12 w-full rounded-full bg-transparent pl-12 pr-20 text-base outline-none placeholder:text-muted-foreground"
          />
          <div className="absolute right-2 flex items-center gap-2">
            <button
              type="button"
              onClick={isRecording ? stopRecording : startRecording}
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-full transition-colors',
                isRecording
                  ? 'bg-red-500 hover:bg-red-600'
                  : 'text-gray-600 hover:bg-primary/30',
                'focus:outline-none'
              )}
            >
              {isRecording ? (
                <Square className="h-4 w-4 text-white" />
              ) : (
                <Mic className="h-5 w-5" />
              )}
              <span className="sr-only">
                {isRecording ? 'Stop recording' : 'Start recording'}
              </span>
            </button>
            {message.trim() || uploadedFiles.length > 0 ? (
              <button
                type="submit"
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full transition-colors',
                  'bg-primary hover:bg-primary/90 focus:bg-primary/90 focus:outline-none'
                )}
              >
                <SendHorizontal className="h-4 w-4 text-white" />
                <span className="sr-only">Send message</span>
              </button>
            ) : null}
          </div>
        </div>
        {uploadedFiles.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {uploadedFiles.map(({ id, file }) => (
              <FileChip
                key={id}
                fileName={file.name}
                fileSize={file.size}
                fileType={file.type || 'application/octet-stream'}
                onRemove={() => handleRemoveFile(id)}
              />
            ))}
          </div>
        )}
      </form>
    )
  }
)

ChatInput.displayName = 'ChatInput'
