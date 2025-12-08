import { useState, useCallback } from 'react'
import { Button } from './ui/Button'
import { Badge } from './ui/Badge'

interface UploadProgress {
    status: 'idle' | 'uploading' | 'pinning' | 'complete' | 'error'
    progress: number
    cid?: string
    error?: string
}

interface IPFSUploadProps {
    onUploadComplete?: (cid: string, url: string) => void
    onError?: (error: string) => void
    maxSizeMB?: number
    acceptedTypes?: string[]
    className?: string
}

export function IPFSUpload({
    onUploadComplete,
    onError,
    maxSizeMB = 10,
    acceptedTypes = ['image/*', 'audio/*', 'video/*', 'application/pdf'],
    className = ''
}: IPFSUploadProps) {
    const [uploadState, setUploadState] = useState<UploadProgress>({
        status: 'idle',
        progress: 0
    })
    const [dragActive, setDragActive] = useState(false)

    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true)
        } else if (e.type === 'dragleave') {
            setDragActive(false)
        }
    }, [])

    const validateFile = (file: File): string | null => {
        if (file.size > maxSizeMB * 1024 * 1024) {
            return `File size exceeds ${maxSizeMB}MB limit`
        }
        return null
    }

    const uploadFile = async (file: File) => {
        const error = validateFile(file)
        if (error) {
            setUploadState({ status: 'error', progress: 0, error })
            onError?.(error)
            return
        }

        setUploadState({ status: 'uploading', progress: 10 })

        try {
            // Simulate upload progress
            const progressInterval = setInterval(() => {
                setUploadState((prev) => ({
                    ...prev,
                    progress: Math.min(prev.progress + 10, 70)
                }))
            }, 200)

            // Create form data
            const formData = new FormData()
            formData.append('file', file)

            // Upload to Pinata
            const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${import.meta.env.VITE_PINATA_JWT}`
                },
                body: formData
            })

            clearInterval(progressInterval)

            if (!response.ok) {
                throw new Error('Upload failed')
            }

            setUploadState({ status: 'pinning', progress: 80 })

            const data = await response.json()
            const cid = data.IpfsHash
            const url = `https://gateway.pinata.cloud/ipfs/${cid}`

            setUploadState({ status: 'complete', progress: 100, cid })
            onUploadComplete?.(cid, url)
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Upload failed'
            setUploadState({ status: 'error', progress: 0, error: errorMessage })
            onError?.(errorMessage)
        }
    }

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setDragActive(false)

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            uploadFile(e.dataTransfer.files[0])
        }
    }, [])

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            uploadFile(e.target.files[0])
        }
    }

    const reset = () => {
        setUploadState({ status: 'idle', progress: 0 })
    }

    return (
        <div className={className}>
            {/* Upload area */}
            {uploadState.status === 'idle' && (
                <label
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    className={`
            flex flex-col items-center justify-center
            p-8 border-2 border-dashed rounded-2xl cursor-pointer
            transition-colors duration-200
            ${dragActive
                            ? 'border-(--primary-brand) bg-(--primary-brand-light)'
                            : 'border-(--border-color) hover:border-(--primary-brand) hover:bg-(--bg-secondary)'
                        }
          `}
                >
                    <input
                        type="file"
                        accept={acceptedTypes.join(',')}
                        onChange={handleFileSelect}
                        className="hidden"
                    />
                    <svg
                        width="48"
                        height="48"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        className="text-(--text-muted) mb-4"
                    >
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="17 8 12 3 7 8" />
                        <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                    <p className="text-sm font-medium text-(--text-primary) mb-1">
                        Drop file here or click to upload
                    </p>
                    <p className="text-xs text-(--text-muted)">
                        Max {maxSizeMB}MB • Images, audio, video, PDF
                    </p>
                </label>
            )}

            {/* Uploading state */}
            {(uploadState.status === 'uploading' || uploadState.status === 'pinning') && (
                <div className="p-6 border border-(--border-color) rounded-2xl">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-(--primary-brand-light) flex items-center justify-center">
                            <svg
                                className="animate-spin text-(--primary-brand)"
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                            >
                                <path d="M21 12a9 9 0 11-6.219-8.56" />
                            </svg>
                        </div>
                        <div>
                            <p className="font-medium text-(--text-primary)">
                                {uploadState.status === 'uploading' ? 'Uploading to IPFS...' : 'Pinning content...'}
                            </p>
                            <p className="text-xs text-(--text-muted)">
                                This may take a moment
                            </p>
                        </div>
                    </div>

                    {/* Progress bar */}
                    <div className="h-2 bg-(--bg-secondary) rounded-full overflow-hidden">
                        <div
                            className="h-full bg-(--primary-brand) transition-all duration-300"
                            style={{ width: `${uploadState.progress}%` }}
                        />
                    </div>
                    <p className="text-xs text-(--text-muted) mt-2 text-center">
                        {uploadState.progress}% complete
                    </p>
                </div>
            )}

            {/* Complete state */}
            {uploadState.status === 'complete' && uploadState.cid && (
                <div className="p-6 border border-(--success-green)/30 bg-(--success-light) rounded-2xl">
                    <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-(--success-green) flex items-center justify-center flex-shrink-0">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                                <path d="M20 6L9 17l-5-5" />
                            </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-medium text-(--success-green) mb-1">Upload Complete</p>
                            <p className="text-xs text-(--text-muted) mb-2">Content is now pinned on IPFS</p>

                            <div className="flex items-center gap-2 flex-wrap">
                                <Badge variant="success" size="sm">
                                    CID: {uploadState.cid.slice(0, 12)}...
                                </Badge>
                                <button
                                    onClick={() => navigator.clipboard.writeText(uploadState.cid!)}
                                    className="text-xs text-(--primary-brand) hover:underline"
                                >
                                    Copy CID
                                </button>
                                <a
                                    href={`https://gateway.pinata.cloud/ipfs/${uploadState.cid}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-(--primary-brand) hover:underline"
                                >
                                    View on IPFS
                                </a>
                            </div>
                        </div>
                    </div>

                    <Button variant="outline" size="sm" onClick={reset} className="mt-4 w-full">
                        Upload Another File
                    </Button>
                </div>
            )}

            {/* Error state */}
            {uploadState.status === 'error' && (
                <div className="p-6 border border-(--error-red)/30 bg-(--error-light) rounded-2xl">
                    <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-(--error-red) flex items-center justify-center flex-shrink-0">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                                <path d="M18 6L6 18M6 6l12 12" />
                            </svg>
                        </div>
                        <div className="flex-1">
                            <p className="font-medium text-(--error-red) mb-1">Upload Failed</p>
                            <p className="text-sm text-(--text-secondary)">{uploadState.error}</p>
                        </div>
                    </div>

                    <Button variant="danger" size="sm" onClick={reset} className="mt-4 w-full">
                        Try Again
                    </Button>
                </div>
            )}

            {/* Privacy notice */}
            {uploadState.status === 'idle' && (
                <p className="text-xs text-(--text-muted) mt-3 text-center">
                    📍 Content uploaded to IPFS is publicly accessible. Do not upload sensitive information.
                </p>
            )}
        </div>
    )
}

interface IPFSStatusBadgeProps {
    cid?: string
    pinned?: boolean
    className?: string
}

export function IPFSStatusBadge({ cid, pinned = true, className = '' }: IPFSStatusBadgeProps) {
    if (!cid) return null

    return (
        <div className={`inline-flex items-center gap-2 ${className}`}>
            <Badge variant={pinned ? 'success' : 'warning'} size="sm" dot>
                {pinned ? 'Pinned' : 'Unpinned'}
            </Badge>
            <span className="text-xs font-mono text-(--text-muted)">
                {cid.slice(0, 8)}...{cid.slice(-4)}
            </span>
        </div>
    )
}
