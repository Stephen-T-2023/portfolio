/* ============================================
   admin/skills.jsx
   Ashborne Portfolio
   Admin skills page — add, edit and delete
   skills grouped by category.
   ============================================ */

import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import supabase from '../../lib/supabaseClient'
import styles from '../../styles/AdminSkills.module.css'
import toast from 'react-hot-toast'

export default function AdminSkills() {
  const router = useRouter()
  const [skills, setSkills] = useState([])
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState('')
  const [category, setCategory] = useState('')
  const [creating, setCreating] = useState(false)

  /* Predefined categories for consistency */
  const categories = ['Frontend', 'Backend', 'Database', 'Tools', 'Design', 'Other']

  useEffect(() => {
    async function init() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/admin/login')
        return
      }
      await fetchSkills()
      setLoading(false)
    }
    init()
  }, [router])

  async function fetchSkills() {
    const { data, error } = await supabase
      .from('skills')
      .select('*')
      .order('category', { ascending: true })

    if (error) {
      toast.error('Failed to load skills')
    } else {
      setSkills(data)
    }
  }

  async function handleCreateSkill(e) {
    e.preventDefault()
    if (!name.trim() || !category.trim()) return
    setCreating(true)

    const { data, error } = await supabase
      .from('skills')
      .insert([{ name: name.trim(), category: category.trim() }])
      .select()

    if (error) {
      toast.error('Failed to create skill')
    } else {
      setSkills([...skills, data[0]])
      setName('')
      toast.success('Skill added')
    }

    setCreating(false)
  }

  async function handleDeleteSkill(id) {
    const { error } = await supabase
      .from('skills')
      .delete()
      .eq('id', id)

    if (error) {
      toast.error('Failed to delete skill')
    } else {
      setSkills(skills.filter(s => s.id !== id))
      toast.success('Skill deleted')
    }
  }

  /* Group skills by category for display */
  const grouped = skills.reduce((acc, skill) => {
    if (!acc[skill.category]) acc[skill.category] = []
    acc[skill.category].push(skill)
    return acc
  }, {})

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
          <div>
            <h2>Skills</h2>
            <p>{skills.length} total</p>
          </div>
        </div>

        {/* Add skill form */}
        <form onSubmit={handleCreateSkill} className={styles.createForm}>
          <div className={styles.formRow}>
            <div className={styles.field}>
              <label>Skill Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. React"
                required
              />
            </div>
            <div className={styles.field}>
              <label>Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={styles.select}
                required
              >
                <option value="">Select category...</option>
                {categories.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              disabled={creating}
              className={styles.addButton}
            >
              {creating ? 'Adding...' : 'Add Skill'}
            </button>
          </div>
        </form>

        {/* Skills grouped by category */}
        {skills.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No skills yet. Add one above.</p>
          </div>
        ) : (
          <div className={styles.categoriesGrid}>
            {Object.entries(grouped).map(([cat, catSkills]) => (
              <div key={cat} className={styles.categoryGroup}>
                <h3 className={styles.categoryTitle}>{cat}</h3>
                <ul className={styles.skillList}>
                  {catSkills.map(skill => (
                    <SkillRow
                      key={skill.id}
                      skill={skill}
                      onDelete={handleDeleteSkill}
                    />
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

/* ============================================
   SkillRow component
   Single skill with delete confirmation
   ============================================ */
function SkillRow({ skill, onDelete }) {
  const [confirming, setConfirming] = useState(false)

  return (
    <li className={styles.skillItem}>
      <span className={styles.skillName}>{skill.name}</span>
      <div className={styles.skillActions}>
        {confirming ? (
          <>
            <button
              className={styles.confirmButton}
              onClick={() => onDelete(skill.id)}
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
          <button
            className={styles.deleteButton}
            onClick={() => setConfirming(true)}
          >
            Delete
          </button>
        )}
      </div>
    </li>
  )
}