import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const STORAGE_URL_KEY = 'cloud_arch_supabase_url'
const STORAGE_KEY_KEY = 'cloud_arch_supabase_anon_key'

// Default fallback to environment variables
const envUrl = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim()
const envAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim()

export function getSupabaseCredentials(): { url: string; anonKey: string; isCustom: boolean } {
  let customUrl = ''
  let customKey = ''

  if (typeof window !== 'undefined') {
    try {
      customUrl = (localStorage.getItem(STORAGE_URL_KEY) || '').trim()
      customKey = (localStorage.getItem(STORAGE_KEY_KEY) || '').trim()
    } catch (e) {
      console.warn('Unable to access localStorage for Supabase credentials', e)
    }
  }

  if (customUrl && customKey) {
    return { url: customUrl, anonKey: customKey, isCustom: true }
  }

  return {
    url: envUrl || '',
    anonKey: envAnonKey || '',
    isCustom: false,
  }
}

export function isSupabaseConfigured(): boolean {
  const { url, anonKey } = getSupabaseCredentials()
  return Boolean(
    url &&
    anonKey &&
    url.startsWith('https://') &&
    url.includes('.supabase.co') &&
    anonKey.length > 20
  )
}

let cachedClient: SupabaseClient | null = null
let cachedSignature = ''

export function getSupabaseClient(): SupabaseClient | null {
  const { url, anonKey } = getSupabaseCredentials()
  if (!url || !anonKey) return null

  const signature = `${url}::${anonKey}`
  if (cachedClient && cachedSignature === signature) {
    return cachedClient
  }

  try {
    cachedClient = createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
    cachedSignature = signature
    return cachedClient
  } catch (err) {
    console.error('Failed to initialize Supabase client:', err)
    return null
  }
}

export function saveSupabaseCredentials(url: string, anonKey: string): boolean {
  try {
    const cleanUrl = url.trim()
    const cleanKey = anonKey.trim()
    localStorage.setItem(STORAGE_URL_KEY, cleanUrl)
    localStorage.setItem(STORAGE_KEY_KEY, cleanKey)
    cachedClient = null
    cachedSignature = ''
    return true
  } catch (e) {
    console.error('Failed to save Supabase credentials', e)
    return false
  }
}

export function clearCustomSupabaseCredentials(): void {
  try {
    localStorage.removeItem(STORAGE_URL_KEY)
    localStorage.removeItem(STORAGE_KEY_KEY)
    cachedClient = null
    cachedSignature = ''
  } catch (e) {
    console.error('Failed to clear Supabase credentials', e)
  }
}

export async function testSupabaseConnection(
  urlInput?: string,
  keyInput?: string
): Promise<{ success: boolean; message: string }> {
  try {
    const url = urlInput?.trim() || getSupabaseCredentials().url
    const key = keyInput?.trim() || getSupabaseCredentials().anonKey

    if (!url || !key) {
      return { success: false, message: 'Please provide both Project URL and Anon API Key.' }
    }

    if (!url.startsWith('https://') || !url.includes('.supabase.co')) {
      return { success: false, message: 'Invalid URL. Expected format: https://<project-ref>.supabase.co' }
    }

    const testClient = createClient(url, key, {
      auth: { persistSession: false },
    })

    // Test a lightweight query to check connectivity
    const { error } = await testClient.from('profiles').select('id', { count: 'exact', head: true })

    if (error && error.code !== 'PGRST116') {
      // 42P01: relation "profiles" does not exist (schema not run yet, but credentials work!)
      if (error.code === '42P01') {
        return {
          success: true,
          message: 'Connected to Supabase! (Note: tables not created yet. Please execute supabase/schema.sql in SQL Editor)',
        }
      }
      return { success: false, message: `Supabase Error: ${error.message} (Code: ${error.code})` }
    }

    return { success: true, message: 'Successfully connected to Supabase Database & Auth!' }
  } catch (err: any) {
    return { success: false, message: err?.message || 'Connection test failed. Check network or CORS settings.' }
  }
}
