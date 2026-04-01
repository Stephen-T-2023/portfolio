/* ============================================
   projects/[slug].jsx
   Ashborne Portfolio
   Public project detail page — shows full
   project info, devlog entries and links.
   The [slug] matches the project slug field
   e.g. /projects/vestige
   ============================================ */

import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import supabase from '../../lib/supabaseClient'
import styles from '../../styles/ProjectDetail.module.css'

export default function ProjectDetail() {
  const router = useRouter()
  const { slug } = router.query

  const [project, setProject] = useState(null)
  const [devlogs, setDevlogs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!slug) return

    async function fetchData() {
      /* Fetch project by slug instead of id */
      const { data: projectData, error } = await supabase
        .from('projects')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'published')
        .single()

      if (error || !projectData) {
        router.push('/projects')
        return
      }

      setProject(projectData)

      /* Fetch devlog entries for this project */
      const { data: devlogData } = await supabase
        .from('devlog_entries')
        .select('*')
        .eq('project_id', projectData.id)
        .order('created_at', { ascending: true })

      if (devlogData) setDevlogs(devlogData)

      setLoading(false)
    }

    fetchData()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug])

  if (loading) return null

  return (
    <div className={styles.page}>
      <div className={styles.inner}>

        {/* Back link */}
        <button
          className={styles.backLink}
          onClick={() => router.push('/projects')}
        >
          ← All Projects
        </button>

        {/* Project header */}
        <div className={styles.projectHeader}>
          {/* Cover image — shown if one has been set via admin */}
            {project.cover_image && (
            <div className={styles.coverImage}>
                <img
                src={project.cover_image}
                alt={project.title}
                className={styles.coverImg}
                />
            </div>
            )}
          <div className={styles.projectMeta}>
          <div className={styles.headerLeft}>
            {project.featured && (
              <span className={styles.featuredBadge}>Featured</span>
            )}
            <h1 className={styles.title}>{project.title}</h1>
            <p className={styles.description}>{project.description}</p>
          </div>

          <div className={styles.headerRight}>
            <div className={styles.links}>
              {project.github_url && (
                <a href={project.github_url} target="_blank" rel="noopener noreferrer" className={styles.linkButton}>
                  GitHub →
                </a>
              )}
              {project.live_url && (
                <a href={project.live_url} target="_blank" rel="noopener noreferrer" className={styles.linkButton}>
                  Live Site →
                </a>
              )}
            </div>

            {project.tags && project.tags.length > 0 && (
              <div className={styles.tags}>
                {project.tags.map(tag => (
                  <span key={tag} className={styles.tag}>{tag}</span>
                ))}
              </div>
            )}
          </div>
        </div>
        </div>

        {/* Devlog section */}
        {devlogs.length > 0 && (
          <div className={styles.devlogSection}>
            <h2 className={styles.devlogHeading}>Devlog</h2>
            <p className={styles.devlogSubheading}>
              {devlogs.length} {devlogs.length === 1 ? 'entry' : 'entries'}
            </p>

            <div className={styles.devlogList}>
              {devlogs.map((entry, index) => (
                <DevlogEntry
                  key={entry.id}
                  entry={entry}
                  index={index + 1}
                />
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

/* ============================================
   DevlogEntry component
   Single devlog entry with expand/collapse.
   ============================================ */
function DevlogEntry({ entry, index }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className={styles.devlogEntry}>
      <button
        className={styles.devlogToggle}
        onClick={() => setExpanded(!expanded)}
      >
        <div className={styles.devlogToggleLeft}>
          <span className={styles.entryNumber}>
            {String(index).padStart(2, '0')}
          </span>
          <span className={styles.entryTitle}>{entry.title}</span>
        </div>
        <div className={styles.devlogToggleRight}>
          <span className={styles.entryDate}>
            {new Date(entry.created_at).toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'short',
              year: 'numeric'
            })}
          </span>
          <span className={styles.toggleIcon}>{expanded ? '▲' : '▼'}</span>
        </div>
      </button>

      {expanded && (
        <div className={styles.entryContent}>
          <p>{entry.content}</p>
        </div>
      )}
    </div>
  )
}