import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-toastify'
import ApperIcon from './ApperIcon'
import { fileService, uploadSessionService } from '../services'

export default function MainFeature({ onStorageUpdate }) {
  const [files, setFiles] = useState([])
  const [uploadQueue, setUploadQueue] = useState([])
  const [isDragOver, setIsDragOver] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('upload')
  const [selectedFiles, setSelectedFiles] = useState([])
  const [viewMode, setViewMode] = useState('grid')
  const fileInputRef = useRef(null)
  const dragCounterRef = useRef(0)

  useEffect(() => {
    loadFiles()
  }, [])

  const loadFiles = async () => {
    setLoading(true)
    try {
      const result = await fileService.getAll()
      setFiles(result || [])
      
      // Update storage stats
      const totalUsed = (result || []).reduce((acc, file) => acc + (file.size || 0), 0)
      onStorageUpdate?.({
        used: totalUsed,
        total: 5000000000
      })
    } catch (err) {
      setError(err.message)
      toast.error("Failed to load files")
    } finally {
      setLoading(false)
    }
  }

  const handleDragEnter = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    dragCounterRef.current++
    if (e.dataTransfer?.items && e.dataTransfer.items.length > 0) {
      setIsDragOver(true)
    }
  }, [])

  const handleDragLeave = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    dragCounterRef.current--
    if (dragCounterRef.current === 0) {
      setIsDragOver(false)
    }
  }, [])

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
    dragCounterRef.current = 0

    const droppedFiles = Array.from(e.dataTransfer?.files || [])
    if (droppedFiles.length > 0) {
      handleFileUpload(droppedFiles)
    }
  }, [])

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files || [])
    if (selectedFiles.length > 0) {
      handleFileUpload(selectedFiles)
    }
  }

  const handleFileUpload = async (fileList) => {
    const validFiles = fileList.filter(file => {
      if (file.size > 100 * 1024 * 1024) { // 100MB limit
        toast.error(`File ${file.name} is too large (max 100MB)`)
        return false
      }
      return true
    })

    if (validFiles.length === 0) return

    // Create upload session
    const sessionId = Date.now().toString()
    const totalSize = validFiles.reduce((acc, file) => acc + file.size, 0)
    
    try {
      await uploadSessionService.create({
        id: sessionId,
        files: validFiles.map(f => f.name),
        startTime: new Date(),
        totalSize,
        completedSize: 0
      })

      // Add files to upload queue
      const queueItems = validFiles.map(file => ({
        id: Date.now() + Math.random(),
        file,
        progress: 0,
        status: 'pending',
        speed: 0,
        timeRemaining: 0
      }))

      setUploadQueue(prev => [...prev, ...queueItems])
      setActiveTab('queue')

      // Start uploads
      for (const item of queueItems) {
        await simulateUpload(item)
      }

    } catch (err) {
      toast.error("Failed to start upload session")
    }
  }

  const simulateUpload = async (queueItem) => {
    const { file } = queueItem
    const startTime = Date.now()
    
    // Update queue item status
    setUploadQueue(prev => prev.map(item => 
      item.id === queueItem.id 
        ? { ...item, status: 'uploading' }
        : item
    ))

    // Simulate upload progress
    for (let progress = 0; progress <= 100; progress += Math.random() * 15 + 5) {
      if (progress > 100) progress = 100
      
      const elapsed = Date.now() - startTime
      const speed = (file.size * (progress / 100)) / (elapsed / 1000) // bytes per second
      const remaining = elapsed * ((100 - progress) / progress) / 1000 // seconds

      setUploadQueue(prev => prev.map(item => 
        item.id === queueItem.id 
          ? { ...item, progress: Math.round(progress), speed, timeRemaining: remaining }
          : item
      ))

      await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 100))
    }

    // Create file record
    try {
      const newFile = await fileService.create({
        name: file.name,
        size: file.size,
        type: file.type,
        uploadDate: new Date(),
        status: 'completed',
        progress: 100,
        url: URL.createObjectURL(file)
      })

      // Update queue status
      setUploadQueue(prev => prev.map(item => 
        item.id === queueItem.id 
          ? { ...item, status: 'completed', progress: 100 }
          : item
      ))

      // Add to files list
      setFiles(prev => [newFile, ...prev])
      toast.success(`${file.name} uploaded successfully`)

      // Update storage stats
      const totalUsed = files.reduce((acc, f) => acc + (f.size || 0), 0) + file.size
      onStorageUpdate?.({
        used: totalUsed,
        total: 5000000000
      })

    } catch (err) {
      setUploadQueue(prev => prev.map(item => 
        item.id === queueItem.id 
          ? { ...item, status: 'error' }
          : item
      ))
      toast.error(`Failed to upload ${file.name}`)
    }
  }

  const removeFromQueue = (queueId) => {
    setUploadQueue(prev => prev.filter(item => item.id !== queueId))
  }

  const deleteFile = async (fileId) => {
    try {
      await fileService.delete(fileId)
      setFiles(prev => prev.filter(f => f.id !== fileId))
      toast.success("File deleted successfully")
      
      // Update storage stats
      const totalUsed = files.filter(f => f.id !== fileId).reduce((acc, f) => acc + (f.size || 0), 0)
      onStorageUpdate?.({
        used: totalUsed,
        total: 5000000000
      })
    } catch (err) {
      toast.error("Failed to delete file")
    }
  }

  const formatBytes = (bytes) => {
    if (!bytes || bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatTime = (seconds) => {
    if (!seconds || seconds === Infinity) return '--'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getFileIcon = (type) => {
    if (type?.startsWith('image/')) return 'Image'
    if (type?.startsWith('video/')) return 'Video'
    if (type?.startsWith('audio/')) return 'Music'
    if (type?.includes('pdf')) return 'FileText'
    if (type?.includes('zip') || type?.includes('rar')) return 'Archive'
    return 'File'
  }

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Tab Navigation */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div className="flex space-x-1 bg-white/60 dark:bg-surface-800/60 backdrop-blur-sm rounded-xl p-1 border border-surface-200/50 dark:border-surface-700/50">
          {[
            { id: 'upload', label: 'Upload Files', icon: 'Upload' },
            { id: 'files', label: 'My Files', icon: 'Folder' },
            { id: 'queue', label: 'Upload Queue', icon: 'Clock' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-surface-700 shadow-card text-primary-600 dark:text-primary-400'
                  : 'text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-surface-200'
              }`}
            >
              <ApperIcon name={tab.icon} className="w-4 h-4" />
              <span className="hidden sm:block font-medium">{tab.label}</span>
              {tab.id === 'queue' && uploadQueue.length > 0 && (
                <span className="w-5 h-5 bg-accent text-white text-xs rounded-full flex items-center justify-center">
                  {uploadQueue.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {activeTab === 'files' && (
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              className="p-2 rounded-lg bg-white/60 dark:bg-surface-800/60 backdrop-blur-sm border border-surface-200/50 dark:border-surface-700/50 hover:bg-white/80 dark:hover:bg-surface-800/80 transition-colors"
            >
              <ApperIcon name={viewMode === 'grid' ? 'List' : 'Grid3X3'} className="w-4 h-4 text-surface-600 dark:text-surface-400" />
            </button>
          </div>
        )}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'upload' && (
          <motion.div
            key="upload"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Upload Zone */}
            <div
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className={`relative group cursor-pointer transition-all duration-300 ${
                isDragOver 
                  ? 'scale-102 rotate-1' 
                  : 'hover:scale-101'
              }`}
            >
              <div className={`gradient-border ${isDragOver ? 'animate-pulse' : ''}`}>
                <div className="gradient-border-inner p-8 md:p-12 text-center relative overflow-hidden">
                  {/* Background Pattern */}
                  <div className="absolute inset-0 opacity-5">
                    <div className="grid grid-cols-8 grid-rows-6 h-full">
                      {Array.from({ length: 48 }).map((_, i) => (
                        <div key={i} className="border border-surface-400 dark:border-surface-600"></div>
                      ))}
                    </div>
                  </div>

                  {/* Upload Content */}
                  <div className="relative z-10">
                    <motion.div
                      className={`w-20 h-20 md:w-24 md:h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center ${
                        isDragOver ? 'animate-bounce-gentle' : 'animate-float'
                      }`}
                      whileHover={{ scale: 1.1, rotate: 5 }}
                    >
                      <ApperIcon name={isDragOver ? "Download" : "Upload"} className="w-10 h-10 md:w-12 md:h-12 text-white" />
                    </motion.div>

                    <h3 className="text-2xl md:text-3xl font-bold text-surface-900 dark:text-surface-100 mb-4">
                      {isDragOver ? "Drop files here!" : "Drag & Drop Files"}
                    </h3>
                    <p className="text-lg text-surface-600 dark:text-surface-400 mb-6">
                      Or click to browse and select files
                    </p>

                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center space-x-3 px-8 py-4 rounded-xl bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-semibold hover:from-primary-700 hover:to-secondary-700 transition-all duration-300 shadow-card hover:shadow-lg transform hover:scale-105"
                    >
                      <ApperIcon name="FolderOpen" className="w-5 h-5" />
                      <span>Select Files</span>
                    </button>

                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      onChange={handleFileSelect}
                      className="hidden"
                      accept="*/*"
                    />

                    <div className="mt-6 text-sm text-surface-500 dark:text-surface-400">
                      <p>Supports all file types • Max 100MB per file</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Total Files', value: files.length, icon: 'Files' },
                { label: 'Storage Used', value: formatBytes(files.reduce((acc, f) => acc + (f.size || 0), 0)), icon: 'HardDrive' },
                { label: 'Active Uploads', value: uploadQueue.filter(q => q.status === 'uploading').length, icon: 'Upload' },
                { label: 'Recent', value: files.filter(f => {
                  const uploadDate = new Date(f.uploadDate)
                  const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
                  return uploadDate > dayAgo
                }).length, icon: 'Clock' }
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  className="p-4 rounded-xl bg-white/60 dark:bg-surface-800/60 backdrop-blur-sm border border-surface-200/50 dark:border-surface-700/50"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
                      <ApperIcon name={stat.icon} className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-surface-900 dark:text-surface-100">
                        {stat.value}
                      </p>
                      <p className="text-sm text-surface-600 dark:text-surface-400">
                        {stat.label}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'queue' && (
          <motion.div
            key="queue"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            <div className="bg-white/60 dark:bg-surface-800/60 backdrop-blur-sm rounded-xl border border-surface-200/50 dark:border-surface-700/50 overflow-hidden">
              {uploadQueue.length === 0 ? (
                <div className="p-12 text-center">
                  <ApperIcon name="Clock" className="w-16 h-16 mx-auto mb-4 text-surface-400" />
                  <h3 className="text-lg font-semibold text-surface-700 dark:text-surface-300 mb-2">
                    No uploads in queue
                  </h3>
                  <p className="text-surface-500 dark:text-surface-400">
                    Upload some files to see them here
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-surface-200/50 dark:divide-surface-700/50">
                  {uploadQueue.map((item) => (
                    <motion.div
                      key={item.id}
                      className="p-4 hover:bg-surface-50/50 dark:hover:bg-surface-700/50 transition-colors"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      layout
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 flex-1 min-w-0">
                          <div className="flex-shrink-0">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                              item.status === 'completed' ? 'bg-green-100 dark:bg-green-900/30' :
                              item.status === 'error' ? 'bg-red-100 dark:bg-red-900/30' :
                              'bg-primary-100 dark:bg-primary-900/30'
                            }`}>
                              <ApperIcon 
                                name={item.status === 'completed' ? 'Check' : item.status === 'error' ? 'X' : getFileIcon(item.file.type)} 
                                className={`w-5 h-5 ${
                                  item.status === 'completed' ? 'text-green-600 dark:text-green-400' :
                                  item.status === 'error' ? 'text-red-600 dark:text-red-400' :
                                  'text-primary-600 dark:text-primary-400'
                                }`} 
                              />
                            </div>
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium text-surface-900 dark:text-surface-100 truncate">
                                {item.file.name}
                              </h4>
                              <span className="text-sm text-surface-500 dark:text-surface-400 ml-2">
                                {formatBytes(item.file.size)}
                              </span>
                            </div>
                            
                            {item.status === 'uploading' && (
                              <div className="space-y-1">
                                <div className="flex items-center justify-between text-xs text-surface-500 dark:text-surface-400">
                                  <span>{item.progress}%</span>
                                  <span>{formatBytes(item.speed)}/s • {formatTime(item.timeRemaining)} left</span>
                                </div>
                                <div className="w-full h-2 bg-surface-200 dark:bg-surface-700 rounded-full overflow-hidden">
                                  <motion.div
                                    className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full relative overflow-hidden"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${item.progress}%` }}
                                    transition={{ duration: 0.3 }}
                                  >
                                    <div className="absolute inset-0 progress-shimmer"></div>
                                  </motion.div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <button
                          onClick={() => removeFromQueue(item.id)}
                          className="ml-4 p-2 rounded-lg text-surface-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                          <ApperIcon name="X" className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === 'files' && (
          <motion.div
            key="files"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              </div>
            ) : files.length === 0 ? (
              <div className="text-center py-12 bg-white/60 dark:bg-surface-800/60 backdrop-blur-sm rounded-xl border border-surface-200/50 dark:border-surface-700/50">
                <ApperIcon name="Folder" className="w-16 h-16 mx-auto mb-4 text-surface-400" />
                <h3 className="text-lg font-semibold text-surface-700 dark:text-surface-300 mb-2">
                  No files uploaded yet
                </h3>
                <p className="text-surface-500 dark:text-surface-400 mb-4">
                  Start by uploading your first file
                </p>
                <button
                  onClick={() => setActiveTab('upload')}
                  className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-colors"
                >
                  <ApperIcon name="Upload" className="w-4 h-4" />
                  <span>Upload Files</span>
                </button>
              </div>
            ) : (
              <div className={`grid gap-4 ${
                viewMode === 'grid' 
                  ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                  : 'grid-cols-1'
              }`}>
                {files.map((file) => (
                  <motion.div
                    key={file.id}
                    className="group bg-white/60 dark:bg-surface-800/60 backdrop-blur-sm rounded-xl border border-surface-200/50 dark:border-surface-700/50 p-4 hover:bg-white/80 dark:hover:bg-surface-800/80 transition-all duration-300 hover:shadow-card"
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ y: -2 }}
                  >
                    <div className={`${viewMode === 'grid' ? 'text-center' : 'flex items-center space-x-4'}`}>
                      {/* File Icon/Preview */}
                      <div className={`${viewMode === 'grid' ? 'mx-auto mb-3' : 'flex-shrink-0'} relative`}>
                        {file.type?.startsWith('image/') ? (
                          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center overflow-hidden">
                            {file.url ? (
                              <img src={file.url} alt={file.name} className="w-full h-full object-cover" />
                            ) : (
                              <ApperIcon name="Image" className="w-6 h-6 text-white" />
                            )}
                          </div>
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
                            <ApperIcon name={getFileIcon(file.type)} className="w-6 h-6 text-white" />
                          </div>
                        )}
                      </div>

                      {/* File Info */}
                      <div className={`${viewMode === 'grid' ? '' : 'flex-1 min-w-0'}`}>
                        <h4 className={`font-medium text-surface-900 dark:text-surface-100 ${viewMode === 'list' ? 'truncate' : ''} mb-1`}>
                          {file.name}
                        </h4>
                        <div className={`text-sm text-surface-500 dark:text-surface-400 ${viewMode === 'grid' ? 'space-y-1' : 'flex items-center space-x-4'}`}>
                          <span>{formatBytes(file.size)}</span>
                          <span className={viewMode === 'grid' ? 'block' : ''}>
                            {new Date(file.uploadDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className={`${viewMode === 'grid' ? 'mt-3 flex justify-center space-x-2' : 'flex items-center space-x-2'}`}>
                        {file.url && (
                          <button
                            onClick={() => window.open(file.url, '_blank')}
                            className="p-2 rounded-lg text-surface-500 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
                            title="Preview"
                          >
                            <ApperIcon name="Eye" className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => {
                            if (file.url) {
                              const a = document.createElement('a')
                              a.href = file.url
                              a.download = file.name
                              a.click()
                            }
                          }}
                          className="p-2 rounded-lg text-surface-500 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                          title="Download"
                        >
                          <ApperIcon name="Download" className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteFile(file.id)}
                          className="p-2 rounded-lg text-surface-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          title="Delete"
                        >
                          <ApperIcon name="Trash2" className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}