/* ============================================
   index.js
   Ashborne Portfolio
   Landing page — hero section with name,
   title, bio and call to action links.
   Fetches bio and social links from Supabase.
   ============================================ */

import { useRouter } from 'next/router'
import supabase from '../lib/supabaseClient'
import styles from '../styles/Home.module.css'
import { useEffect, useState, useRef } from 'react'

export default function Home() {
  const router = useRouter()
  const [settings, setSettings] = useState({})
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentProject, setCurrentProject] = useState(0)
  const timerRef = useRef(null)

  useEffect(() => {
    async function fetchData() {
      /* Fetch site settings — bio and social links */
      const { data: settingsData } = await supabase
        .from('settings')
        .select('*')

      if (settingsData) {
        const map = {}
        settingsData.forEach(row => { map[row.key] = row.value })
        setSettings(map)
      }

      /* Fetch featured published projects for
         the preview section on the landing page */
      const { data: projectsData } = await supabase
        .from('projects')
        .select('id, title, slug, short_description, tags')
        .eq('status', 'published')
        .eq('featured', true)
        .limit(3)

      if (projectsData) setProjects(projectsData)

      setLoading(false)
    }

    fetchData()
  }, [])

  /* Auto cycle through projects every 4 seconds */
  useEffect(() => {
    if (projects.length <= 1) return
    startTimer()
    return () => clearInterval(timerRef.current)
  }, [projects])

  function startTimer() {
    clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setCurrentProject(p =>
        p === projects.length - 1 ? 0 : p + 1
      )
    }, 4000)
  }

  /* Reset timer when user manually navigates */
  function resetTimer() {
    startTimer()
  }

  return (
    <div className={styles.page}>

      {/* Hero section */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.heroContent}>
            <p className={styles.label}>Developer & Designer</p>
            <h1 className={styles.name}>Stephen Thomas</h1>
            <p className={styles.bio}>
              {settings.bio || 'Building purposeful digital experiences.'}
            </p>

            <div className={styles.heroActions}>
              <button
                className={styles.primaryButton}
                onClick={() => router.push('/projects')}
              >
                View Projects
              </button>
              <button
                className={styles.secondaryButton}
                onClick={() => router.push('/about')}
              >
                About Me
              </button>
            </div>

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

          {/* Decorative right panel — cycles through featured projects */}
          <div className={styles.heroDecor}>
            <div className={styles.decorBox}>
              <span className={styles.decorLabel}>Current builds</span>
              <span className={styles.decorProject}>
                {projects[currentProject]?.title}
              </span>
              <span className={styles.decorSub}>
                {projects[currentProject]?.short_description}
              </span>
              <div className={styles.decorDivider} />
              <span className={styles.decorLabel}>Stack</span>
              <div className={styles.decorStack}>
                {projects[currentProject]?.tags?.slice(0, 4).map(t => (
                  <span key={t} className={styles.decorTag}>{t}</span>
                ))}
              </div>

              {/* Navigation dots */}
              {projects.length > 1 && (
                <div className={styles.decorNav}>
                  <button
                    className={styles.decorNavButton}
                    onClick={() => {
                      setCurrentProject(p =>
                        p === 0 ? projects.length - 1 : p - 1
                      )
                      resetTimer()
                    }}
                  >
                    ←
                  </button>
                  <div className={styles.decorDots}>
                    {projects.map((_, i) => (
                      <button
                        key={i}
                        className={`${styles.decorDot} ${i === currentProject ? styles.decorDotActive : ''}`}
                        onClick={() => {
                          setCurrentProject(i)
                          resetTimer()
                        }}
                      />
                    ))}
                  </div>
                  <button
                    className={styles.decorNavButton}
                    onClick={() => {
                      setCurrentProject(p =>
                        p === projects.length - 1 ? 0 : p + 1
                      )
                      resetTimer()
                    }}
                  >
                    →
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Featured projects preview */}
      {projects.length > 0 && (
        <section className={styles.featured}>
          <div className={styles.sectionInner}>
            <div className={styles.sectionHeader}>
              <h2>Featured Projects</h2>
              <button
                className={styles.viewAll}
                onClick={() => router.push('/projects')}
              >
                View all →
              </button>
            </div>

            <div className={styles.projectsGrid}>
              {projects.map(project => (
                <button
                  key={project.id}
                  className={styles.projectCard}
                  onClick={() => router.push(`/projects/${project.slug}`)}
                >
                  {project.cover_image && (
                    <div className={styles.cardImageWrap}>
                      <img
                        src={project.cover_image}
                        alt={project.title}
                        className={styles.cardImg}
                      />
                    </div>
                  )}
                  <div className={styles.cardContent}>
                    <h3 className={styles.cardTitle}>{project.title}</h3>
                    <p className={styles.cardDescription}>
                      {project.short_description}
                    </p>
                    {project.tags && project.tags.length > 0 && (
                      <div className={styles.cardTags}>
                        {project.tags.slice(0, 3).map(tag => (
                          <span key={tag} className={styles.tag}>{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <span className={styles.cardArrow}>→</span>
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

    </div>
  )
}