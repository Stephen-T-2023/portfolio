/* ============================================
   admin/projects/[id].jsx
   Ashborne Portfolio
   Individual project edit page — update project
   details, manage devlog entries and images.
   ============================================ */

import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import supabase from '../../../lib/supabaseClient'
import styles from '../../../styles/AdminProjectEdit.module.css'
import toast from 'react-hot-toast'

export default function AdminProjectEdit() {
  const router = useRouter()
  const { id } = router.query

  const [project, setProject] = useState(null)
  const [devlogs, setDevlogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeSection, setActiveSection] = useState('details')

  /* Project form state */
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [shortDescription, setShortDescription] = useState('')
  const [description, setDescription] = useState('')
  const [tags, setTags] = useState('')
  const [githubUrl, setGithubUrl] = useState('')
  const [liveUrl, setLiveUrl] = useState('')
  const [featured, setFeatured] = useState(false)
  const [status, setStatus] = useState('draft')

  /* Devlog form state */
  const [devlogTitle, setDevlogTitle] = useState('')
  const [devlogContent, setDevlogContent] = useState('')
  const [creatingDevlog, setCreatingDevlog] = useState(false)
  const [showDevlogForm, setShowDevlogForm] = useState(false)

  useEffect(() => {
    if (!id) return

    async function init() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/admin/login')
        return
      }

      await fetchProject()
      await fetchDevlogs()
      setLoading(false)
    }

    init()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, router])

  async function fetchProject() {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      toast.error('Failed to load project')
      return
    }

    setProject(data)

    /* Populate form fields with existing values */
    setTitle(data.title)
    setSlug(data.slug)
    setShortDescription(data.short_description || '')
    setDescription(data.description || '')
    setTags(data.tags ? data.tags.join(', ') : '')
    setGithubUrl(data.github_url || '')
    setLiveUrl(data.live_url || '')
    setFeatured(data.featured)
    setStatus(data.status)
  }

  async function fetchDevlogs() {
    const { data, error } = await supabase
      .from('devlog_entries')
      .select('*')
      .eq('project_id', id)
      .order('created_at', { ascending: false })

    if (error) {
      toast.error('Failed to load devlog entries')
    } else {
      setDevlogs(data)
    }
  }

  async function handleSaveProject(e) {
    e.preventDefault()
    setSaving(true)

    const tagsArray = tags.split(',').map(t => t.trim()).filter(Boolean)

    const { error } = await supabase
      .from('projects')
      .update({
        title: title.trim(),
        slug: slug.trim(),
        short_description: shortDescription.trim(),
        description: description.trim(),
        tags: tagsArray,
        github_url: githubUrl.trim() || null,
        live_url: liveUrl.trim() || null,
        featured,
        status,
      })
      .eq('id', id)

    if (error) {
      toast.error('Failed to save project')
    } else {
      toast.success('Project saved')
    }

    setSaving(false)
  }

  async function handleCreateDevlog(e) {
    e.preventDefault()
    if (!devlogTitle.trim() || !devlogContent.trim()) return
    setCreatingDevlog(true)

    const { data, error } = await supabase
      .from('devlog_entries')
      .insert([{
        project_id: id,
        title: devlogTitle.trim(),
        content: devlogContent.trim(),
      }])
      .select()

    if (error) {
      toast.error('Failed to create devlog entry')
    } else {
      setDevlogs([data[0], ...devlogs])
      setDevlogTitle('')
      setDevlogContent('')
      setShowDevlogForm(false)
      toast.success('Devlog entry created')
    }

    setCreatingDevlog(false)
  }

  async function handleDeleteDevlog(devlogId) {
    const { error } = await supabase
      .from('devlog_entries')
      .delete()
      .eq('id', devlogId)

    if (error) {
      toast.error('Failed to delete devlog entry')
    } else {
      setDevlogs(devlogs.filter(d => d.id !== devlogId))
      toast.success('Devlog entry deleted')
    }
  }

  if (loading) return null

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.logo}>Ashborne</h1>
        <button
          className={styles.backButton}
          onClick={() => router.push('/admin/projects')}
        >
          ← Projects
        </button>
      </header>

      <div className={styles.layout}>

        {/* Sidebar */}
        <aside className={styles.sidebar}>
          <div className={styles.sidebarProject}>
            <span className={styles.sidebarLabel}>Editing</span>
            <span className={styles.sidebarTitle}>{project?.title}</span>
            <span className={`${styles.sidebarStatus} ${project?.status === 'published' ? styles.published : styles.draft}`}>
              {project?.status}
            </span>
          </div>

          <nav className={styles.sidebarNav}>
            <button
              className={`${styles.sidebarLink} ${activeSection === 'details' ? styles.sidebarLinkActive : ''}`}
              onClick={() => setActiveSection('details')}
            >
              Details
            </button>
            <button
              className={`${styles.sidebarLink} ${activeSection === 'devlog' ? styles.sidebarLinkActive : ''}`}
              onClick={() => setActiveSection('devlog')}
            >
              <span>Devlog</span>
              <span className={styles.sidebarCount}>{devlogs.length}</span>
            </button>
          </nav>
        </aside>

        {/* Main content */}
        <main className={styles.main}>

          {/* Project details section */}
          {activeSection === 'details' && (
            <form onSubmit={handleSaveProject} className={styles.section}>
              <div className={styles.sectionHeader}>
                <h2>Project Details</h2>
                <button
                  type="submit"
                  disabled={saving}
                  className={styles.saveButton}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>

              <div className={styles.formGrid}>
                <div className={styles.field}>
                  <label>Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>

                <div className={styles.field}>
                  <label>Slug</label>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
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
                    rows={8}
                    placeholder="Full project description"
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

                <div className={`${styles.field} ${styles.fullWidth}`}>
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={featured}
                      onChange={(e) => setFeatured(e.target.checked)}
                      className={styles.checkbox}
                    />
                    Featured project
                  </label>
                </div>
              </div>
            </form>
          )}

          {/* Devlog section */}
          {activeSection === 'devlog' && (
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <h2>Devlog</h2>
                <button
                  className={styles.newButton}
                  onClick={() => setShowDevlogForm(!showDevlogForm)}
                >
                  {showDevlogForm ? 'Cancel' : '+ New Entry'}
                </button>
              </div>

              {/* New devlog entry form */}
              {showDevlogForm && (
                <form onSubmit={handleCreateDevlog} className={styles.devlogForm}>
                  <div className={styles.field}>
                    <label>Entry Title</label>
                    <input
                      type="text"
                      value={devlogTitle}
                      onChange={(e) => setDevlogTitle(e.target.value)}
                      placeholder="Session 1 — Project Setup"
                      required
                    />
                  </div>
                  <div className={styles.field} style={{ marginTop: '1rem' }}>
                    <label>Content</label>
                    <textarea
                      value={devlogContent}
                      onChange={(e) => setDevlogContent(e.target.value)}
                      placeholder="What did you build this session..."
                      rows={10}
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={creatingDevlog}
                    className={styles.saveButton}
                    style={{ marginTop: '1rem' }}
                  >
                    {creatingDevlog ? 'Creating...' : 'Create Entry'}
                  </button>
                </form>
              )}

              {/* Devlog entries list */}
              {devlogs.length === 0 ? (
                <div className={styles.emptyState}>
                  <p>No devlog entries yet. Add one above.</p>
                </div>
              ) : (
                <ul className={styles.devlogList}>
                  {devlogs.map(entry => (
                    <DevlogRow
                      key={entry.id}
                      entry={entry}
                      onDelete={handleDeleteDevlog}
                    />
                  ))}
                </ul>
              )}
            </div>
          )}

        </main>
      </div>
    </div>
  )
}

/* ============================================
   DevlogRow component
   Displays a single devlog entry with expand
   to read full content and delete confirmation.
   ============================================ */
function DevlogRow({ entry, onDelete }) {
  const [expanded, setExpanded] = useState(false)
  const [confirming, setConfirming] = useState(false)

  return (
    <li className={styles.devlogItem}>
      <div className={styles.devlogHeader}>
        <div className={styles.devlogInfo}>
          <h3 className={styles.devlogTitle}>{entry.title}</h3>
          <span className={styles.devlogDate}>
            {new Date(entry.created_at).toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'short',
              year: 'numeric'
            })}
          </span>
        </div>

        <div className={styles.devlogActions}>
          {confirming ? (
            <>
              <span className={styles.confirmText}>Delete entry?</span>
              <button
                className={styles.confirmButton}
                onClick={() => onDelete(entry.id)}
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
                onClick={() => setExpanded(!expanded)}
              >
                {expanded ? 'Collapse' : 'Read'}
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
      </div>

      {expanded && (
        <div className={styles.devlogContent}>
          <p>{entry.content}</p>
        </div>
      )}
    </li>
  )
}