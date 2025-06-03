import { motion } from 'framer-motion'
import ApperIcon from './ApperIcon'

const StorageIndicator = ({ used, total, loading, error }) => {
  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const percentage = total > 0 ? (used / total) * 100 : 0
  const circumference = 2 * Math.PI * 45
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  const getStorageColor = () => {
    if (percentage < 60) return 'text-green-500'
    if (percentage < 80) return 'text-yellow-500'
    return 'text-red-500'
  }

  const getProgressColor = () => {
    if (percentage < 60) return 'from-green-500 to-green-400'
    if (percentage < 80) return 'from-yellow-500 to-yellow-400'
    return 'from-red-500 to-red-400'
  }

  if (loading) {
    return (
      <motion.div 
        className="bg-white/60 dark:bg-surface-800/60 backdrop-blur-sm border border-surface-200/50 dark:border-surface-700/50 rounded-2xl p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center justify-center space-x-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500"></div>
          <span className="text-surface-600 dark:text-surface-400">Loading storage info...</span>
        </div>
      </motion.div>
    )
  }

  if (error) {
    return (
      <motion.div 
        className="bg-white/60 dark:bg-surface-800/60 backdrop-blur-sm border border-surface-200/50 dark:border-surface-700/50 rounded-2xl p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center justify-center space-x-3 text-red-500">
          <ApperIcon name="AlertCircle" className="w-5 h-5" />
          <span>Error loading storage info</span>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div 
      className="bg-white/60 dark:bg-surface-800/60 backdrop-blur-sm border border-surface-200/50 dark:border-surface-700/50 rounded-2xl p-6 shadow-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      whileHover={{ y: -2 }}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
            <ApperIcon name="HardDrive" className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-100">
              Storage Usage
            </h3>
            <p className="text-sm text-surface-500 dark:text-surface-400">
              Track your file storage
            </p>
          </div>
        </div>
        
        {/* Circular Progress */}
        <div className="relative w-20 h-20">
          <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              className="text-surface-200 dark:text-surface-700"
            />
            <motion.circle
              cx="50"
              cy="50"
              r="45"
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className={`${getStorageColor()} transition-colors duration-500`}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-lg font-bold ${getStorageColor()}`}>
              {Math.round(percentage)}%
            </span>
          </div>
        </div>
      </div>

      {/* Storage Details */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-sm text-surface-600 dark:text-surface-400">Used Storage</span>
          <span className="text-sm font-medium text-surface-900 dark:text-surface-100">
            {formatBytes(used)}
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-surface-600 dark:text-surface-400">Total Storage</span>
          <span className="text-sm font-medium text-surface-900 dark:text-surface-100">
            {formatBytes(total)}
          </span>
        </div>

        {/* Linear Progress Bar */}
        <div className="pt-2">
          <div className="w-full bg-surface-200 dark:bg-surface-700 rounded-full h-2 overflow-hidden">
            <motion.div
              className={`h-full bg-gradient-to-r ${getProgressColor()} rounded-full relative`}
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
            >
              <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
            </motion.div>
          </div>
          <div className="flex justify-between mt-2 text-xs text-surface-500 dark:text-surface-400">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>

        {/* Storage Status */}
        <div className={`text-center p-3 rounded-xl ${
          percentage < 60 ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300' :
          percentage < 80 ? 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300' :
          'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
        }`}>
          <div className="flex items-center justify-center space-x-2">
            <ApperIcon 
              name={percentage < 60 ? "CheckCircle" : percentage < 80 ? "AlertTriangle" : "AlertCircle"} 
              className="w-4 h-4" 
            />
            <span className="text-sm font-medium">
              {percentage < 60 ? 'Plenty of space available' :
               percentage < 80 ? 'Storage getting full' :
               'Storage almost full'}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default StorageIndicator