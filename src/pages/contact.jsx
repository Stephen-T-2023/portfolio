/* ============================================
   contact.jsx
   Ashborne Portfolio
   Public contact page — displays social links
   and email fetched from Supabase settings.
   ============================================ */

import { useEffect, useState } from 'react'
import supabase from '../lib/supabaseClient'
import styles from '../styles/Contact.module.css'

export default function Contact() {
  const [settings, setSettings] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchSettings() {
      const { data } = await supabase
        .from('settings')
        .select('*')

      if (data) {
        const map = {}
        data.forEach(row => { map[row.key] = row.value })
        setSettings(map)
      }

      setLoading(false)
    }

    fetchSettings()
  }, [])

  if (loading) return null

  return (
    <div className={styles.page}>
      <div className={styles.inner}>

        <div className={styles.header}>
          <p className={styles.label}>Get in touch</p>
          <h1 className={styles.title}>Contact</h1>
          <p className={styles.subtitle}>
            Open to work, collaborations and interesting projects.
          </p>
        </div>

        <div className={styles.linksGrid}>

          {/* Email */}
          {settings.email && (
            <a href={`mailto:${settings.email}`} className={styles.linkCard}>
              <span className={styles.linkLabel}>Email</span>
              <span className={styles.linkValue}>{settings.email}</span>
              <span className={styles.linkArrow}>→</span>
            </a>
          )}

          {/* GitHub */}
          {settings.github && (
            <a href={settings.github} target="_blank" rel="noopener noreferrer" className={styles.linkCard}>
              <span className={styles.linkLabel}>GitHub</span>
              <span className={styles.linkValue}>{settings.github.replace('https://', '')}</span>
              <span className={styles.linkArrow}>→</span>
            </a>
          )}

          {/* LinkedIn */}
          {settings.linkedin && (
            <a href={settings.linkedin} target="_blank" rel="noopener noreferrer" className={styles.linkCard}>
              <span className={styles.linkLabel}>LinkedIn</span>
              <span className={styles.linkValue}>{settings.linkedin.replace('https://', '')}</span>
              <span className={styles.linkArrow}>→</span>
            </a>
          )}

          {/* Twitter */}
          {settings.twitter && (
            <a href={settings.twitter} target="_blank" rel="noopener noreferrer" className={styles.linkCard}>
              <span className={styles.linkLabel}>Twitter</span>
              <span className={styles.linkValue}>{settings.twitter.replace('https://', '')}</span>
              <span className={styles.linkArrow}>→</span>
            </a>
          )}

        </div>

      </div>
    </div>
  )
}