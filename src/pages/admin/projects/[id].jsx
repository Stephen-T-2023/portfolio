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

  const [uploading, setUploading] = useState(false)
  const [images, setImages] = useState([])

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
      await fetchImages()
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

  /* Fetch all images for this project */
  async function fetchImages() {
    const { data, error } = await supabase
      .from('project_images')
      .select('*')
      .eq('project_id', id)
      .order('order', { ascending: true })

    if (error) {
      toast.error('Failed to load images')
    } else {
      setImages(data)
    }
  }

  /* Handle image file upload to Supabase Storage
     then save the public URL to project_images table */
  async function handleImageUpload(e) {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)

    /* Create a unique filename using timestamp */
    const fileExt = file.name.split('.').pop()
    const fileName = `${id}-${Date.now()}.${fileExt}`

    /* Upload file to Supabase Storage bucket */
    const { error: uploadError } = await supabase.storage
      .from('project-images')
      .upload(fileName, file)

    if (uploadError) {
      toast.error('Failed to upload image')
      setUploading(false)
      return
    }

    /* Get the public URL of the uploaded file */
    const { data: { publicUrl } } = supabase.storage
      .from('project-images')
      .getPublicUrl(fileName)

    /* Save the URL to the project_images table */
    const { data, error: dbError } = await supabase
      .from('project_images')
      .insert([{
        project_id: id,
        url: publicUrl,
        order: images.length,
      }])
      .select()

    if (dbError) {
      toast.error('Failed to save image')
    } else {
      setImages([...images, data[0]])
      toast.success('Image uploaded')
    }

    setUploading(false)
  }

  /* Delete an image from storage and database */
  async function handleDeleteImage(image) {
    /* Extract filename from the full URL */
    const fileName = image.url.split('/').pop()

    /* Delete from Supabase Storage */
    await supabase.storage
      .from('project-images')
      .remove([fileName])

    /* Delete from database */
    const { error } = await supabase
      .from('project_images')
      .delete()
      .eq('id', image.id)

    if (error) {
      toast.error('Failed to delete image')
    } else {
      setImages(images.filter(img => img.id !== image.id))
      toast.success('Image deleted')
    }
  }

  /* Set a project image as the cover image by saving
     its URL to the projects table cover_image column */
  async function handleSetCover(image) {
    const { error } = await supabase
      .from('projects')
      .update({ cover_image: image.url })
      .eq('id', id)

    if (error) {
      toast.error('Failed to set cover image')
    } else {
      toast.success('Cover image set')
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
            <button
              className={`${styles.sidebarLink} ${activeSection === 'images' ? styles.sidebarLinkActive : ''}`}
              onClick={() => setActiveSection('images')}
            >
              <span>Images</span>
              <span className={styles.sidebarCount}>{images.length}</span>
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
          {/* Images section */}
          {activeSection === 'images' && (
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <h2>Images</h2>
                <label className={styles.uploadLabel}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className={styles.fileInput}
                    disabled={uploading}
                  />
                  {uploading ? 'Uploading...' : '+ Upload Image'}
                </label>
              </div>

              {images.length === 0 ? (
                <div className={styles.emptyState}>
                  <p>No images yet. Upload one above.</p>
                </div>
              ) : (
                <div className={styles.imagesGrid}>
                  {images.map(image => (
                    <div key={image.id} className={styles.imageCard}>
                      <img
                        src={image.url}
                        alt={image.caption || 'Project image'}
                        className={styles.imagePreview}
                      />
                      <div className={styles.imageActions}>
                        <button
                          className={styles.actionButton}
                          onClick={() => handleSetCover(image)}
                        >
                          Set as cover
                        </button>
                        <button
                          className={styles.deleteButton}
                          onClick={() => handleDeleteImage(image)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
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