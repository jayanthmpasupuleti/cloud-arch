import { getSupabaseClient } from './supabase'
import type { User, Session, AuthChangeEvent } from '@supabase/supabase-js'

export interface SignUpParams {
  email: string
  password: string
  name: string
  role?: string
  targetRole?: string
  startDate?: string
}

export async function signInWithGoogle(): Promise<{ error: string | null }> {
  const supabase = getSupabaseClient()
  if (!supabase) {
    return { error: 'Supabase is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment.' }
  }

  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    })

    if (error) {
      return { error: error.message }
    }

    return { error: null }
  } catch (err: any) {
    return { error: err?.message || 'Google authentication failed to initialize.' }
  }
}

export async function signUpWithEmail({
  email,
  password,
  name,
  role = 'Senior Data Engineer',
  targetRole = 'Lead Cloud Solutions Architect',
  startDate,
}: SignUpParams): Promise<{ user: User | null; session: Session | null; error: string | null }> {
  const supabase = getSupabaseClient()
  if (!supabase) {
    return { user: null, session: null, error: 'Supabase client is not configured.' }
  }

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role,
          target_role: targetRole,
          start_date: startDate || new Date().toISOString().split('T')[0],
          avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name || email)}`,
        },
      },
    })

    if (error) {
      return { user: null, session: null, error: error.message }
    }

    return { user: data.user, session: data.session, error: null }
  } catch (err: any) {
    return { user: null, session: null, error: err?.message || 'An unexpected error occurred during signup.' }
  }
}

export async function signInWithEmail(
  email: string,
  password: string
): Promise<{ user: User | null; session: Session | null; error: string | null }> {
  const supabase = getSupabaseClient()
  if (!supabase) {
    return { user: null, session: null, error: 'Supabase client is not configured.' }
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return { user: null, session: null, error: error.message }
    }

    return { user: data.user, session: data.session, error: null }
  } catch (err: any) {
    return { user: null, session: null, error: err?.message || 'An unexpected error occurred during signin.' }
  }
}

export async function signOutUser(): Promise<{ error: string | null }> {
  const supabase = getSupabaseClient()
  if (!supabase) return { error: null }

  try {
    const { error } = await supabase.auth.signOut()
    if (error) return { error: error.message }
    return { error: null }
  } catch (err: any) {
    return { error: err?.message || 'Error signing out' }
  }
}

export async function resetPassword(email: string): Promise<{ success: boolean; error: string | null }> {
  const supabase = getSupabaseClient()
  if (!supabase) {
    return { success: false, error: 'Supabase client is not configured.' }
  }

  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email)
    if (error) return { success: false, error: error.message }
    return { success: true, error: null }
  } catch (err: any) {
    return { success: false, error: err?.message || 'Password reset request failed.' }
  }
}

export async function getSession(): Promise<Session | null> {
  const supabase = getSupabaseClient()
  if (!supabase) return null

  try {
    const { data } = await supabase.auth.getSession()
    return data.session
  } catch (e) {
    console.warn('Failed to retrieve session:', e)
    return null
  }
}

export function subscribeToAuthChanges(
  callback: (event: AuthChangeEvent, session: Session | null) => void
): (() => void) | null {
  const supabase = getSupabaseClient()
  if (!supabase) return null

  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange(callback)

  return () => {
    subscription.unsubscribe()
  }
}
