import { useState, useRef } from 'react'
import { uploadFile } from '../lib/ipfs'

interface FileUploadProps {
    onFileUploaded: (url: string, type: 'image' | 'file', fileName: string) => void
    disabled?: boolean
}

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
const ALLOWED_FILE_TYPES = [...ALLOWED_IMAGE_TYPES, 'application/pdf', 'text/plain', 'application/json']

export default function FileUpload({ onFileUploaded, disabled }: FileUploadProps) {
    const [isUploading, setIsUploading] = useState(false)
    const [uploadProgress, setUploadProgress] = useState('')
    const [error, setError] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        setError(null)

        // Validate file size
        if (file.size > MAX_FILE_SIZE) {
            setError('File too large. Maximum size is 10MB.')
            return
        }

        // Validate file type
        if (!ALLOWED_FILE_TYPES.includes(file.type)) {
            setError('File type not supported. Use images, PDF, or text files.')
            return
        }

        setIsUploading(true)
        setUploadProgress('Uploading to IPFS...')

        try {
            const cid = await uploadFile(file)
            const url = `https://gateway.pinata.cloud/ipfs/${cid}`
            const fileType = ALLOWED_IMAGE_TYPES.includes(file.type) ? 'image' : 'file'

            setUploadProgress('Upload complete!')
            onFileUploaded(url, fileType, file.name)

            setTimeout(() => {
                setUploadProgress('')
                setIsUploading(false)
            }, 1500)
        } catch (err) {
            console.error('File upload error:', err)
            setError('Failed to upload file. Please try again.')
            setIsUploading(false)
            setUploadProgress('')
        }

        // Reset input
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    return (
        <div className="relative">
            <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileSelect}
                accept={ALLOWED_FILE_TYPES.join(',')}
                className="hidden"
                disabled={disabled || isUploading}
            />

            <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={disabled || isUploading}
                className={`p-2 rounded-lg transition-colors ${isUploading
                        ? 'bg-(--bg-secondary) text-(--text-muted) cursor-wait'
                        : 'hover:bg-(--bg-secondary) text-(--text-secondary) hover:text-(--primary-brand)'
                    }`}
                title="Attach file or image"
            >
                {isUploading ? (
                    <div className="w-5 h-5 border-2 border-(--primary-brand) border-t-transparent rounded-full animate-spin" />
                ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                    </svg>
                )}
            </button>

            {/* Status Toast */}
            {(uploadProgress || error) && (
                <div className={`absolute bottom-full mb-2 left-0 px-3 py-2 rounded-lg text-xs whitespace-nowrap animate-fade-in ${error ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                    }`}>
                    {error || uploadProgress}
                </div>
            )}
        </div>
    )
}
