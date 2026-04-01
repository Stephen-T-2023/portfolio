/* ============================================
   admin/settings.jsx
   Ashborne Portfolio
   Admin settings page — manage social links
   and contact information stored in Supabase.
   These are fetched by the public portfolio pages.
   ============================================ */

import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import supabase from '../../lib/supabaseClient'
import styles from '../../styles/AdminSettings.module.css'
import toast from 'react-hot-toast'

export default function AdminSettings() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  /* Social and contact fields */
  const [email, setEmail] = useState('')
  const [github, setGithub] = useState('')
  const [linkedin, setLinkedin] = useState('')
  const [twitter, setTwitter] = useState('')
  const [bio, setBio] = useState('')

  useEffect(() => {
    async function init() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/admin/login')
        return
      }
      await fetchSettings()
      setLoading(false)
    }
    init()
  }, [router])

  async function fetchSettings() {
    const { data, error } = await supabase
      .from('settings')
      .select('*')

    if (error) {
      toast.error('Failed to load settings')
      return
    }

    /* Convert array of key/value rows into a map
       for easy access by key name */
    const map = {}
    data.forEach(row => { map[row.key] = row.value })

    setEmail(map.email || '')
    setGithub(map.github || '')
    setLinkedin(map.linkedin || '')
    setTwitter(map.twitter || '')
    setBio(map.bio || '')
  }

  /* Upsert each setting — updates if exists,
     inserts if it doesn't */
  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)

    const settings = [
      { key: 'email', value: email },
      { key: 'github', value: github },
      { key: 'linkedin', value: linkedin },
      { key: 'twitter', value: twitter },
      { key: 'bio', value: bio },
    ]

    const { error } = await supabase
      .from('settings')
      .upsert(settings, { onConflict: 'key' })

    if (error) {
      toast.error('Failed to save settings')
    } else {
      toast.success('Settings saved')
    }

    setSaving(false)
  }

  if (loading) return null

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.logo}>Ashborne</h1>
        <button
          className={styles.backButton}
          onClick={() => router.push('/admin')}
        >
          ← Dashboard
        </button>
      </header>

      <main className={styles.main}>
        <div className={styles.pageHeader}>
          <h2>Socials & Contact</h2>
          <p>These values are used across the public portfolio site.</p>
        </div>

        <form onSubmit={handleSave} className={styles.form}>
          <div className={styles.field}>
            <label>Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="A short bio shown on the about page..."
              rows={4}
            />
          </div>

          <div className={styles.field}>
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>

          <div className={styles.field}>
            <label>GitHub URL</label>
            <input
              type="url"
              value={github}
              onChange={(e) => setGithub(e.target.value)}
              placeholder="https://github.com/yourusername"
            />
          </div>

          <div className={styles.field}>
            <label>LinkedIn URL</label>
            <input
              type="url"
              value={linkedin}
              onChange={(e) => setLinkedin(e.target.value)}
              placeholder="https://linkedin.com/in/yourusername"
            />
          </div>

          <div className={styles.field}>
            <label>Twitter / X URL</label>
            <input
              type="url"
              value={twitter}
              onChange={(e) => setTwitter(e.target.value)}
              placeholder="https://twitter.com/yourusername"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className={styles.saveButton}
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </form>
      </main>
    </div>
  )
}