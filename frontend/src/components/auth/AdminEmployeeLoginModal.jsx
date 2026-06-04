// src/components/auth/AdminEmployeeLoginModal.jsx
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { adminLogin, getAdminProfile } from '../../api/adminAuth'   // ← new imports
import { login as employeeLoginApi } from '../../api/auth'           // for employee
import { getErrorMessage } from '../../utils/errors'
import Input from '../ui/Input'
import Button from '../ui/Button'
import { ROUTES } from '../../constants/routes'

const roleCopy = {
  employee: {
    label: 'Employee Login',
    description: 'Sign in for employee self-service and task management.',
  },
  admin: {
    label: 'Admin Login',
    description: 'Sign in to manage users, settings, and analytics.',
  },
}

export default function AdminEmployeeLoginModal({ isOpen, onClose, initialRole = 'employee' }) {
  const { login } = useAuth()   // get login method
  const navigate = useNavigate()

  const [activeRole, setActiveRole] = useState(initialRole)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!isOpen) return
    setActiveRole(initialRole)
    setEmail('')
    setPassword('')
    setError('')
    setIsSubmitting(false)
  }, [isOpen, initialRole])

  const header = useMemo(() => roleCopy[activeRole] || roleCopy.employee, [activeRole])

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email.')
      return
    }
    if (!password) {
      setError('Please enter your password.')
      return
    }

    try {
      setError('')
      setIsSubmitting(true)

      if (activeRole === 'admin') {
        // --- ADMIN TOKEN LOGIN ---
        // 1. Login to get token
        const res = await adminLogin(email, password)

        const token =
          res?.data?.data?.token ||
          res?.data?.access_token ||
          res?.data?.accessToken ||
          res?.data?.token ||
          res?.data?.data?.access_token ||
          res?.data?.data?.accessToken ||
          ''

        if (!token) {
          setError('Login succeeded but token was not returned.')
          setIsSubmitting(false)
          return
        }

        // Store token in localStorage
        localStorage.setItem('access_token', token)

        // 2. Extract or fetch admin profile
        let fetchedUser = res?.data?.data?.admin || res?.data?.admin
        if (!fetchedUser) {
          try {
            const profileResponse = await getAdminProfile()
            fetchedUser = profileResponse.data?.data || profileResponse.data || {}
          } catch (profileErr) {
            fetchedUser = {}
          }
        }

        const adminUser = {
          ...fetchedUser,
          role: 'admin',
        }

        console.log('Admin login success. Storing user:', adminUser, 'Token:', token)

        // 3. Store admin user and token in Zustand
        login(adminUser, token)

        // 4. Close modal and redirect
        onClose?.()
        navigate(ROUTES.ADMIN.DASHBOARD)
      } else {
        // --- EMPLOYEE TOKEN LOGIN (existing logic) ---
        const res = await employeeLoginApi(email, password)

        const token =
          res?.data?.access_token ||
          res?.data?.accessToken ||
          res?.data?.token ||
          res?.data?.data?.access_token ||
          res?.data?.data?.accessToken ||
          ''

        const userData =
          res?.data?.user ||
          res?.data?.data?.user ||
          { role: 'employee' }

        if (!token) {
          setError('Login succeeded but token was not returned.')
          setIsSubmitting(false)
          return
        }

        login(userData, token)
        onClose?.()
        // Employee dashboard redirect if needed
        navigate(ROUTES.EMPLOYEE.DASHBOARD)
      }
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Glassmorphic Backdrop overlay with backdrop blur */}
      <div 
        className="fixed inset-0 bg-slate-950/40 dark:bg-aim-navy/85 backdrop-blur-md transition-opacity duration-300 animate-fade-in"
        onClick={onClose}
      />

      {/* Modal Box */}
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-aim-navy-card p-8 shadow-2xl shadow-slate-950/10 dark:shadow-black/80 animate-slide-up z-10">
        {/* Top gradient accent bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-purple-500 to-amber-400 rounded-t-3xl" />
        {/* Radial Ambient Glows */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-amber-400/8 dark:bg-aim-gold/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 bg-purple-500/8 dark:bg-aim-purple/10 rounded-full blur-2xl pointer-events-none" />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:text-aim-copy-muted dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer z-20"
          aria-label="Close modal"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Role Toggle Tabs */}
        <div className="flex rounded-xl bg-slate-100 dark:bg-aim-navy-light p-1 mb-6 border border-slate-200/60 dark:border-white/5 relative z-10">
          <button
            type="button"
            onClick={() => {
              setActiveRole('employee')
              setError('')
            }}
            className={`flex-1 text-center py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 cursor-pointer ${
              activeRole === 'employee'
                ? 'bg-amber-500 text-white font-bold shadow-md shadow-amber-500/20'
                : 'text-slate-500 hover:text-slate-800 dark:text-aim-copy-muted dark:hover:text-white'
            }`}
          >
            Employee
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveRole('admin')
              setError('')
            }}
            className={`flex-1 text-center py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 cursor-pointer ${
              activeRole === 'admin'
                ? 'bg-aim-purple text-white font-bold shadow-md shadow-aim-purple/20'
                : 'text-slate-500 hover:text-slate-800 dark:text-aim-copy-muted dark:hover:text-white'
            }`}
          >
            Admin
          </button>
        </div>

        {/* Header Title & Description */}
        <div className="text-center mb-6 relative z-10">
          <h3 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white mb-2">
            {header.label}
          </h3>
          <p className="text-xs text-slate-500 dark:text-aim-copy-muted leading-relaxed max-w-[280px] mx-auto">
            {header.description}
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
          {error && (
            <div className="p-3 rounded-lg border border-red-500/20 bg-red-500/10 text-red-400 text-xs font-semibold text-center animate-pulse">
              {error}
            </div>
          )}

          <Input
            label="Email Address"
            type="email"
            placeholder="name@aimdigitalise.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={
              <svg className="h-5 w-5 text-aim-copy-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.206" />
              </svg>
            }
            required
            autoFocus
          />

          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            icon={
              <svg className="h-5 w-5 text-aim-copy-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            }
            required
          />

          <div className="pt-2">
            <Button
              type="submit"
              variant={activeRole === 'admin' ? 'danger' : 'primary'}
              className="w-full py-3 text-sm font-bold shadow-lg transition-transform duration-200 hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
              isLoading={isSubmitting}
            >
              Sign In as {activeRole === 'admin' ? 'Admin' : 'Employee'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}