/* ============================================
   about.jsx
   Ashborne Portfolio
   Public about page — bio and skills grouped
   by category. Data fetched from Supabase.
   ============================================ */

import { useEffect, useState } from 'react'
import supabase from '../lib/supabaseClient'
import styles from '../styles/About.module.css'

export default function About() {
  const [settings, setSettings] = useState({})
  const [skills, setSkills] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      /* Fetch bio and social links */
      const { data: settingsData } = await supabase
        .from('settings')
        .select('*')

      if (settingsData) {
        const map = {}
        settingsData.forEach(row => { map[row.key] = row.value })
        setSettings(map)
      }

      /* Fetch skills and group by category */
      const { data: skillsData } = await supabase
        .from('skills')
        .select('*')
        .order('category', { ascending: true })

      if (skillsData) {
        const grouped = skillsData.reduce((acc, skill) => {
          if (!acc[skill.category]) acc[skill.category] = []
          acc[skill.category].push(skill)
          return acc
        }, {})
        setSkills(grouped)
      }

      setLoading(false)
    }

    fetchData()
  }, [])

  if (loading) return null

  return (
    <div className={styles.page}>
      <div className={styles.inner}>

        {/* Bio section */}
        <section className={styles.bioSection}>
          <div className={styles.bioLeft}>
            <p className={styles.label}>About</p>
            <h1 className={styles.name}>Stephen Thomas</h1>
          </div>
          <div className={styles.bioRight}>
            <p className={styles.bio}>
              {settings.bio || 'Building purposeful digital experiences.'}
            </p>

            {/* Social links */}
            <div className={styles.socials}>
              {settings.github && (
                <a href={settings.github} target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
                  GitHub
                </a>
              )}
              {settings.linkedin && (
                <a href={settings.linkedin} target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
                  LinkedIn
                </a>
              )}
              {settings.twitter && (
                <a href={settings.twitter} target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
                  Twitter
                </a>
              )}
              {settings.email && (
                <a href={`mailto:${settings.email}`} className={styles.socialLink}>
                  Email
                </a>
              )}
            </div>
          </div>
        </section>

        {/* Skills section */}
        {Object.keys(skills).length > 0 && (
          <section className={styles.skillsSection}>
            <h2 className={styles.sectionTitle}>Skills & Stack</h2>
            <div className={styles.skillsGrid}>
              {Object.entries(skills).map(([category, categorySkills]) => (
                <div key={category} className={styles.skillCategory}>
                  <h3 className={styles.categoryTitle}>{category}</h3>
                  <ul className={styles.skillList}>
                    {categorySkills.map(skill => (
                      <li key={skill.id} className={styles.skillItem}>
                        {skill.name}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        )}

      </div>
    </div>
  )
}