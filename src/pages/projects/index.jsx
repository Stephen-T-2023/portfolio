/* ============================================
   projects/index.jsx
   Ashborne Portfolio
   Public projects page — displays all published
   projects with tag filtering.
   ============================================ */

import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import supabase from '../../lib/supabaseClient'
import styles from '../../styles/Projects.module.css'

export default function Projects() {
  const router = useRouter()
  const [projects, setProjects] = useState([])
  const [filtered, setFiltered] = useState([])
  const [tags, setTags] = useState([])
  const [activeTag, setActiveTag] = useState('All')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchProjects() {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('status', 'published')
        .order('created_at', { ascending: false })

      if (error) return

      setProjects(data)
      setFiltered(data)

      /* Build unique tags list from all projects */
      const allTags = data.flatMap(p => p.tags || [])
      const uniqueTags = ['All', ...new Set(allTags)]
      setTags(uniqueTags)
      setLoading(false)
    }

    fetchProjects()
  }, [])

  /* Filter projects by selected tag */
  function handleTagFilter(tag) {
    setActiveTag(tag)
    if (tag === 'All') {
      setFiltered(projects)
    } else {
      setFiltered(projects.filter(p => p.tags && p.tags.includes(tag)))
    }
  }

  if (loading) return null

  return (
    <div className={styles.page}>
      <div className={styles.inner}>

        <div className={styles.pageHeader}>
          <h1>Projects</h1>
          <p>{projects.length} projects</p>
        </div>

        {/* Tag filter bar */}
        {tags.length > 1 && (
          <div className={styles.tagFilter}>
            {tags.map(tag => (
              <button
                key={tag}
                className={`${styles.tagButton} ${activeTag === tag ? styles.tagButtonActive : ''}`}
                onClick={() => handleTagFilter(tag)}
              >
                {tag}
              </button>
            ))}
          </div>
        )}

        {/* Projects grid */}
        {filtered.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No projects found.</p>
          </div>
        ) : (
          <div className={styles.projectsGrid}>
            {filtered.map(project => (
              <button
                key={project.id}
                className={`${styles.projectCard} ${project.featured ? styles.featured : ''}`}
                onClick={() => router.push(`/projects/${project.slug}`)}
              >
                {/* Featured badge */}
                {project.featured && (
                  <span className={styles.featuredBadge}>Featured</span>
                )}

                <div className={styles.cardBody}>
                  <h2 className={styles.cardTitle}>{project.title}</h2>
                  <p className={styles.cardDescription}>
                    {project.short_description}
                  </p>
                </div>

                {project.tags && project.tags.length > 0 && (
                  <div className={styles.cardFooter}>
                    <div className={styles.cardTags}>
                      {project.tags.map(tag => (
                        <span key={tag} className={styles.tag}>{tag}</span>
                      ))}
                    </div>
                    <span className={styles.cardArrow}>→</span>
                  </div>
                )}
              </button>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}