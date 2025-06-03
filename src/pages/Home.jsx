import { useState, useEffect } from 'react'
import MainFeature from '../components/MainFeature'
import ApperIcon from '../components/ApperIcon'
import { motion } from 'framer-motion'
import { fileService } from '../services'

export default function Home() {
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [storageStats, setStorageStats] = useState({ used: 0, total: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadStorageStats = async () => {
      setLoading(true)
      try {
        const files = await fileService.getAll()
        const totalUsed = files.reduce((acc, file) => acc + (file.size || 0), 0)
        setStorageStats({
          used: totalUsed,
          total: 5000000000 // 5GB limit
        })
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    
    loadStorageStats()
  }, [])

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode)
    document.documentElement.classList.toggle('dark')
  }

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const storagePercentage = (storageStats.used / storageStats.total) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface-50 via-primary-50 to-secondary-50 dark:from-surface-900 dark:via-surface-800 dark:to-surface-900 transition-colors duration-500">
      {/* Header */}
      <header className="relative z-10 border-b border-surface-200/50 dark:border-surface-700/50 backdrop-blur-xl bg-white/80 dark:bg-surface-900/80">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <motion.div 
              className="flex items-center space-x-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="relative">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center shadow-card">
                  <ApperIcon name="Cloud" className="w-5 h-5 md:w-6 md:h-6 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-accent rounded-full animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                  DropZone
                </h1>
                <p className="text-xs text-surface-500 dark:text-surface-400 hidden sm:block">
                  File Management Tool
                </p>
              </div>
            </motion.div>

            {/* Storage Stats & Controls */}
            <div className="flex items-center space-x-4">
              {/* Storage Indicator */}
              {!loading && !error && (
                <motion.div 
                  className="hidden md:flex items-center space-x-3 bg-white/60 dark:bg-surface-800/60 rounded-xl px-4 py-2 backdrop-blur-sm border border-surface-200/50 dark:border-surface-700/50"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="flex items-center space-x-2">
                    <ApperIcon name="HardDrive" className="w-4 h-4 text-surface-600 dark:text-surface-400" />
                    <div className="text-sm">
                      <span className="font-medium text-surface-700 dark:text-surface-300">
                        {formatBytes(storageStats.used)}
                      </span>
                      <span className="text-surface-500 dark:text-surface-400">
                        /{formatBytes(storageStats.total)}
                      </span>
                    </div>
                  </div>
                  <div className="w-16 h-2 bg-surface-200 dark:bg-surface-700 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${storagePercentage}%` }}
                      transition={{ duration: 1, delay: 0.5 }}
                    />
                  </div>
                </motion.div>
              )}

              {/* Dark Mode Toggle */}
              <motion.button
                onClick={toggleDarkMode}
                className="p-2 md:p-3 rounded-xl bg-white/60 dark:bg-surface-800/60 backdrop-blur-sm border border-surface-200/50 dark:border-surface-700/50 hover:bg-white/80 dark:hover:bg-surface-800/80 transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, rotate: -180 }}
                animate={{ opacity: 1, rotate: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <ApperIcon 
                  name={isDarkMode ? "Sun" : "Moon"} 
                  className="w-4 h-4 md:w-5 md:h-5 text-surface-600 dark:text-surface-400" 
                />
              </motion.button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Hero Section */}
        <motion.div 
          className="text-center mb-12 md:mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.8, delay: 0.2 }}
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-surface-900 dark:text-surface-100 mb-4 md:mb-6">
            Fast File Management
            <span className="block text-primary-600 dark:text-primary-400">
              Made Simple
            </span>
          </h2>
          <p className="text-lg md:text-xl text-surface-600 dark:text-surface-400 max-w-3xl mx-auto leading-relaxed">
            Upload, organize, and manage your files with our intuitive drag-and-drop interface. 
            Experience lightning-fast uploads with real-time progress tracking.
          </p>
        </motion.div>

        {/* Main Upload Feature */}
        <MainFeature onStorageUpdate={(newStats) => setStorageStats(newStats)} />

        {/* Features Grid */}
        <motion.div 
          className="mt-16 md:mt-24 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          {[
            {
              icon: "Upload",
              title: "Drag & Drop",
              description: "Simply drag files into the upload zone for instant uploading"
            },
            {
              icon: "BarChart3",
              title: "Progress Tracking",
              description: "Monitor upload progress with real-time speed and completion stats"
            },
            {
              icon: "Eye",
              title: "File Preview",
              description: "Preview images and documents before and after upload"
            },
            {
              icon: "Folder",
              title: "Organization",
              description: "Keep your files organized with smart categorization"
            },
            {
              icon: "Shield",
              title: "Secure Storage",
              description: "Your files are encrypted and stored securely in the cloud"
            },
            {
              icon: "Share2",
              title: "Easy Sharing",
              description: "Share files instantly with generated secure links"
            }
          ].map((feature, index) => (
            <motion.div
              key={feature.title}
              className="group p-6 rounded-2xl bg-white/60 dark:bg-surface-800/60 backdrop-blur-sm border border-surface-200/50 dark:border-surface-700/50 hover:bg-white/80 dark:hover:bg-surface-800/80 transition-all duration-300"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 + index * 0.1 }}
              whileHover={{ y: -5 }}
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <ApperIcon name={feature.icon} className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-100 mb-2">
                {feature.title}
              </h3>
              <p className="text-surface-600 dark:text-surface-400 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="mt-16 md:mt-24 border-t border-surface-200/50 dark:border-surface-700/50 bg-white/30 dark:bg-surface-900/30 backdrop-blur-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-surface-600 dark:text-surface-400">
              © 2024 DropZone. Secure file management for everyone.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}