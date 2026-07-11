'use client'

/**
 * NCTIRS Auth Context
 * -------------------------------------------------------------------------
 * Session is held server-side as an httpOnly cookie the browser cannot read.
 * The client never touches the token; it hydrates identity by calling
 * `/api/auth/me` and clears it via `/api/auth/logout`. This removes the
 * localStorage token (XSS-exfiltration risk) entirely.
 */
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import {
    login as apiLogin,
    register as apiRegister,
    me as apiMe,
    logout as apiLogout,
    User,
    LoginCredentials,
} from '@/lib/api'

interface AuthContextType {
    user: User | null
    isAuthenticated: boolean
    isLoading: boolean
    login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string }>
    register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>
    logout: () => Promise<void>
}

interface RegisterData {
    email: string
    password: string
    name?: string
    agency?: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    // Hydrate from the httpOnly session cookie on mount.
    useEffect(() => {
        let active = true
        apiMe()
            .then((res) => { if (active) setUser(res.user) })
            .catch(() => { if (active) setUser(null) })
            .finally(() => { if (active) setIsLoading(false) })
        return () => { active = false }
    }, [])

    const login = useCallback(async (credentials: LoginCredentials) => {
        try {
            const response = await apiLogin(credentials)
            setUser(response.user)
            return { success: true }
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Login failed'
            return { success: false, error: message }
        }
    }, [])

    const register = useCallback(async (data: RegisterData) => {
        try {
            await apiRegister(data)
            const loginResult = await apiLogin({ email: data.email, password: data.password })
            setUser(loginResult.user)
            return { success: true }
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Registration failed'
            return { success: false, error: message }
        }
    }, [])

    const logout = useCallback(async () => {
        try { await apiLogout() } finally { setUser(null) }
    }, [])

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: !!user,
                isLoading,
                login,
                register,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}

// HOC for protected routes. Note: this is defense-in-depth UX only — the
// authoritative gate is middleware.ts on the server.
export function withAuth<P extends object>(Component: React.ComponentType<P>) {
    return function ProtectedRoute(props: P) {
        const { isAuthenticated, isLoading } = useAuth()

        useEffect(() => {
            if (!isLoading && !isAuthenticated && typeof window !== 'undefined') {
                window.location.href = '/login'
            }
        }, [isAuthenticated, isLoading])

        if (isLoading) return null
        if (!isAuthenticated) return null
        return <Component {...props} />
    }
}
