/* ============================================
   admin/projects.jsx
   Ashborne Portfolio
   Admin projects page — view all projects,
   create new ones, toggle featured and published
   status, navigate to edit individual projects.
   ============================================ */

import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import supabase from '../../lib/supabaseClient'
import styles from '../../styles/AdminProjects.module.css'
import toast from 'react-hot-toast'

export default function AdminProjects() {
  const router = useRouter()
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [showForm, setShowForm] = useState(false)

  /* New project form state */
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [shortDescription, setShortDescription] = useState('')
  const [description, setDescription] = useState('')
  const [tags, setTags] = useState('')
  const [githubUrl, setGithubUrl] = useState('')
  const [liveUrl, setLiveUrl] = useState('')
  const [featured, setFeatured] = useState(false)
  const [status, setStatus] = useState('draft')

  useEffect(() => {
    async function init() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/admin/login')
        return
      }
      await fetchProjects()
      setLoading(false)
    }
    init()
  }, [router])

  async function fetchProjects() {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      toast.error('Failed to load projects')
    } else {
      setProjects(data)
    }
  }

  /* Auto generate slug from title — replaces spaces
     with hyphens and lowercases everything */
  function handleTitleChange(value) {
    setTitle(value)
    setSlug(value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''))
  }

  async function handleCreateProject(e) {
    e.preventDefault()
    if (!title.trim() || !slug.trim()) return
    setCreating(true)

    /* Convert comma separated tags string to array */
    const tagsArray = tags.split(',').map(t => t.trim()).filter(Boolean)

    const { data, error } = await supabase
      .from('projects')
      .insert([{
        title: title.trim(),
        slug: slug.trim(),
        short_description: shortDescription.trim(),
        description: description.trim(),
        tags: tagsArray,
        github_url: githubUrl.trim() || null,
        live_url: liveUrl.trim() || null,
        featured,
        status,
      }])
      .select()

    if (error) {
      toast.error('Failed to create project')
    } else {
      setProjects([data[0], ...projects])
      toast.success('Project created')
      resetForm()
      setShowForm(false)
    }

    setCreating(false)
  }

  async function handleDeleteProject(id) {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id)

    if (error) {
      toast.error('Failed to delete project')
    } else {
      setProjects(projects.filter(p => p.id !== id))
      toast.success('Project deleted')
    }
  }

  /* Toggle featured status directly from the list */
  async function handleToggleFeatured(project) {
    const { error } = await supabase
      .from('projects')
      .update({ featured: !project.featured })
      .eq('id', project.id)

    if (error) {
      toast.error('Failed to update project')
    } else {
      setProjects(projects.map(p =>
        p.id === project.id ? { ...p, featured: !p.featured } : p
      ))
      toast.success(project.featured ? 'Removed from featured' : 'Marked as featured')
    }
  }

  /* Toggle published/draft status directly from the list */
  async function handleToggleStatus(project) {
    const newStatus = project.status === 'published' ? 'draft' : 'published'
    const { error } = await supabase
      .from('projects')
      .update({ status: newStatus })
      .eq('id', project.id)

    if (error) {
      toast.error('Failed to update project')
    } else {
      setProjects(projects.map(p =>
        p.id === project.id ? { ...p, status: newStatus } : p
      ))
      toast.success(`Project ${newStatus}`)
    }
  }

  function resetForm() {
    setTitle('')
    setSlug('')
    setShortDescription('')
    setDescription('')
    setTags('')
    setGithubUrl('')
    setLiveUrl('')
    setFeatured(false)
    setStatus('draft')
  }

  if (loading) return null

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.logo}>Ashborne</h1>
        <div className={styles.headerRight}>
          <button
            className={styles.backButton}
            onClick={() => router.push('/admin')}
          >
            ← Dashboard
          </button>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.pageHeader}>
          <div>
            <h2>Projects</h2>
            <p>{projects.length} total</p>
          </div>
          <button
            className={styles.newButton}
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? 'Cancel' : '+ New Project'}
          </button>
        </div>

        {/* Create project form */}
        {showForm && (
          <form onSubmit={handleCreateProject} className={styles.createForm}>
            <h3>New Project</h3>

            <div className={styles.formGrid}>
              <div className={styles.field}>
                <label>Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Project title"
                  required
                />
              </div>

              <div className={styles.field}>
                <label>Slug</label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="project-slug"
                  required
                />
              </div>

              <div className={`${styles.field} ${styles.fullWidth}`}>
                <label>Short Description</label>
                <input
                  type="text"
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                  placeholder="One line summary shown on project cards"
                />
              </div>

              <div className={`${styles.field} ${styles.fullWidth}`}>
                <label>Full Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Full project description shown on the detail page"
                  rows={5}
                />
              </div>

              <div className={styles.field}>
                <label>Tags</label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="React, Next.js, Supabase"
                />
              </div>

              <div className={styles.field}>
                <label>GitHub URL</label>
                <input
                  type="url"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  placeholder="https://github.com/..."
                />
              </div>

              <div className={styles.field}>
                <label>Live URL</label>
                <input
                  type="url"
                  value={liveUrl}
                  onChange={(e) => setLiveUrl(e.target.value)}
                  placeholder="https://..."
                />
              </div>

              <div className={styles.field}>
                <label>Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className={styles.select}
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>
            </div>

            <div className={styles.formFooter}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className={styles.checkbox}
                />
                Featured project
              </label>
              <button
                type="submit"
                disabled={creating}
                className={styles.submitButton}
              >
                {creating ? 'Creating...' : 'Create Project'}
              </button>
            </div>
          </form>
        )}

        {/* Projects list */}
        {projects.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No projects yet. Create one above.</p>
          </div>
        ) : (
          <ul className={styles.projectList}>
            {projects.map(project => (
              <ProjectRow
                key={project.id}
                project={project}
                onDelete={handleDeleteProject}
                onToggleFeatured={handleToggleFeatured}
                onToggleStatus={handleToggleStatus}
                onEdit={() => router.push(`/admin/projects/${project.id}`)}
              />
            ))}
          </ul>
        )}
      </main>
    </div>
  )
}

/* ============================================
   ProjectRow component
   Displays a single project in the admin list
   with quick action buttons.
   ============================================ */
function ProjectRow({ project, onDelete, onToggleFeatured, onToggleStatus, onEdit }) {
  const [confirming, setConfirming] = useState(false)

  return (
    <li className={styles.projectItem}>
      <div className={styles.projectInfo}>
        <div className={styles.projectMeta}>
          {/* Status badge */}
          <span className={`${styles.statusBadge} ${project.status === 'published' ? styles.published : styles.draft}`}>
            {project.status}
          </span>
          {/* Featured badge */}
          {project.featured && (
            <span className={styles.featuredBadge}>Featured</span>
          )}
        </div>
        <h3 className={styles.projectTitle}>{project.title}</h3>
        <p className={styles.projectSlug}>/{project.slug}</p>
        {project.tags && project.tags.length > 0 && (
          <div className={styles.tagList}>
            {project.tags.map(tag => (
              <span key={tag} className={styles.tag}>{tag}</span>
            ))}
          </div>
        )}
      </div>

      <div className={styles.projectActions}>
        {confirming ? (
          <>
            <span className={styles.confirmText}>Delete project?</span>
            <button
              className={styles.confirmButton}
              onClick={() => onDelete(project.id)}
            >
              Yes
            </button>
            <button
              className={styles.cancelButton}
              onClick={() => setConfirming(false)}
            >
              Cancel
            </button>
          </>
        ) : (
          <>
            <button
              className={styles.actionButton}
              onClick={() => onToggleStatus(project)}
            >
              {project.status === 'published' ? 'Unpublish' : 'Publish'}
            </button>
            <button
              className={styles.actionButton}
              onClick={() => onToggleFeatured(project)}
            >
              {project.featured ? 'Unfeature' : 'Feature'}
            </button>
            <button
              className={styles.actionButton}
              onClick={onEdit}
            >
              Edit
            </button>
            <button
              className={styles.deleteButton}
              onClick={() => setConfirming(true)}
            >
              Delete
            </button>
          </>
        )}
      </div>
    </li>
  )
}