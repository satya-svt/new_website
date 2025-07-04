import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { supabase, getCurrentUserEmail } from '../lib/supabase'
import { Send, CheckCircle, AlertCircle, ChevronDown, Weight, Hash, LogOut } from 'lucide-react'

const feedOptions = [
  'Corn(Maize)', 'Soyameal', 'Cotton', 'Field Bean(Broad Bean, Faba Bean)',
  'Field Pea', 'Fodder Legumes', 'Fodderbeet', 'Groundnut(Peanut)', 'Lentil',
  'Chickpea', 'Millet', 'Oats', 'Oilseed Rape', 'Pigeon pea/cowpea/mungbean',
  'Potato', 'Rice', 'Rye', 'Safflower', 'Sorghum', 'Soybean', 'Spring barley',
  'Sugarbeet', 'Sunflower', 'Sweet Potato',
  'Temperate Grassland: Grass/Legume Swards',
  'Temperate Grassland: Permanent Grass and Sown Grass or Leys',
  'Tropical Grasses', 'Wheat', 'Winter barley'
]

const unitOptions = ['gms', 'kg', 'Quintal', 'Tons']

export default function UserForm() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({ feed_type: '', quantity: '', unit: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/auth')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus('idle')

    try {
      const userEmail = await getCurrentUserEmail()
      if (!userEmail) throw new Error('User email not found. Please ensure you are logged in.')

      const dataToInsert = {
        name: formData.feed_type,
        description: `Feed quantity: ${formData.quantity} ${formData.unit}`,
        category: 'feed',
        value: parseFloat(formData.quantity.toString()) || 0,
        status: 'active',
        tags: [formData.feed_type, formData.unit],
        priority: 'medium',
        user_email: userEmail
      }

      const { error } = await supabase.from('data_rows').insert([dataToInsert])
      if (error) throw error

      setSubmitStatus('success')
      setFormData({ feed_type: '', quantity: '', unit: '' })
      setTimeout(() => setSubmitStatus('idle'), 5000)
    } catch (error) {
      console.error('Error submitting form:', error)
      setSubmitStatus('error')
      setErrorMessage(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  const isFormValid = formData.feed_type && formData.quantity && formData.unit

  if (submitStatus === 'success') {
    return (
      <motion.div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center p-4">
        <motion.div className="max-w-md w-full bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-8 text-center">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Thank You!</h2>
          <p className="text-gray-300 mb-6">Your response has been successfully submitted.</p>
          <motion.button
            onClick={() => setSubmitStatus('idle')}
            className="w-full bg-gray-800 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Submit Another Response
          </motion.button>
        </motion.div>
      </motion.div>
    )
  }

  return (
    <motion.div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center p-4">
      <motion.div
        className="max-w-2xl w-full bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-10 shadow-2xl"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <div className="flex justify-between items-center mb-8">
          <div className="text-center flex-1">
            <h1 className="text-3xl font-bold text-white mb-2">FEED</h1>
            <p className="text-gray-300">Please enter feed information below</p>
          </div>
          <motion.button
            onClick={handleLogout}
            className="bg-red-600/20 hover:bg-red-600/30 text-red-400 hover:text-red-300 p-2 rounded-lg transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </motion.button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
              <label htmlFor="feed_type" className="block text-sm font-medium text-gray-300 mb-2">
                Type of Feed
              </label>
              <div className="relative">
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                <select
                  id="feed_type"
                  value={formData.feed_type}
                  onChange={(e) => setFormData(prev => ({ ...prev, feed_type: e.target.value }))}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-300 appearance-none cursor-pointer"
                  required
                >
                  <option value="">Select feed type</option>
                  {feedOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
              <label htmlFor="quantity" className="block text-sm font-medium text-gray-300 mb-2">
                Quantity of Feed
              </label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="number"
                  id="quantity"
                  value={formData.quantity}
                  onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-300"
                  placeholder="Enter quantity"
                  required
                />
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }}>
              <label htmlFor="unit" className="block text-sm font-medium text-gray-300 mb-2">
                Select Weight Unit
              </label>
              <div className="relative">
                <Weight className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                <select
                  id="unit"
                  value={formData.unit}
                  onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value }))}
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-300 appearance-none cursor-pointer"
                  required
                >
                  <option value="">Select unit</option>
                  {unitOptions.map(unit => (
                    <option key={unit} value={unit}>{unit}</option>
                  ))}
                </select>
              </div>
            </motion.div>
          </div>

          {submitStatus === 'error' && (
            <motion.div className="flex items-center space-x-2 text-red-400 bg-red-900/20 border border-red-500/20 rounded-lg p-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">{errorMessage}</span>
            </motion.div>
          )}

          <motion.button
            type="submit"
            disabled={!isFormValid || isSubmitting}
            className="w-full bg-gray-800 hover:bg-gray-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:hover:scale-100 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
            whileHover={{ scale: isFormValid && !isSubmitting ? 1.05 : 1 }}
            whileTap={{ scale: isFormValid && !isSubmitting ? 0.95 : 1 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Submitting...</span>
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                <span>Submit Response</span>
              </>
            )}
          </motion.button>
        </form>
      </motion.div>
    </motion.div>
  )
}