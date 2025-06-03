import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import ApperIcon from '../components/ApperIcon'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-surface-50 via-primary-50 to-secondary-50 dark:from-surface-900 dark:via-surface-800 dark:to-surface-900">
      <div className="text-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
            <ApperIcon name="FileX" className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-6xl font-bold text-surface-900 dark:text-surface-100 mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-surface-700 dark:text-surface-300 mb-4">
            Page Not Found
          </h2>
          <p className="text-surface-600 dark:text-surface-400 mb-8 max-w-md mx-auto">
            The file you're looking for seems to have been moved or deleted. Let's get you back to your files.
          </p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Link
            to="/"
            className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-medium hover:from-primary-700 hover:to-secondary-700 transition-all duration-300 shadow-card hover:shadow-lg"
          >
            <ApperIcon name="Home" className="w-5 h-5" />
            <span>Return to DropZone</span>
          </Link>
        </motion.div>
      </div>
    </div>
  )
}