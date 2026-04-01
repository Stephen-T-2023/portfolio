/* ============================================
   admin/index.jsx
   Ashborne Portfolio
   Admin dashboard — protected route, redirects
   to login if not authenticated. Central hub
   for managing projects, skills and settings.
   ============================================ */

import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import supabase from '../../lib/supabaseClient'
import styles from '../../styles/Admin.module.css'

export default function AdminDashboard() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    projects: 0,
    skills: 0,
    devlogs: 0,
  })

  useEffect(() => {
    async function init() {
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        router.push('/admin/login')
        return
      }

      setUser(session.user)
      await fetchStats()
      setLoading(false)
    }

    init()
  }, [router])

  /* Fetch counts for the dashboard overview */
  async function fetchStats() {
    const [{ count: projects }, { count: skills }, { count: devlogs }] =
      await Promise.all([
        supabase.from('projects').select('*', { count: 'exact', head: true }),
        supabase.from('skills').select('*', { count: 'exact', head: true }),
        supabase.from('devlog_entries').select('*', { count: 'exact', head: true }),
      ])

    setStats({
      projects: projects || 0,
      skills: skills || 0,
      devlogs: devlogs || 0,
    })
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/admin/login')
  }

  if (loading) return null

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.logo}>Ashborne</h1>
        <div className={styles.headerRight}>
          <span className={styles.email}>{user.email}</span>
          <button className={styles.logoutButton} onClick={handleLogout}>
            Sign out
          </button>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.pageHeader}>
          <h2>Admin Dashboard</h2>
          <p>Manage your portfolio content.</p>
        </div>

        {/* Stats overview */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <span className={styles.statNumber}>{stats.projects}</span>
            <span className={styles.statLabel}>Projects</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statNumber}>{stats.skills}</span>
            <span className={styles.statLabel}>Skills</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statNumber}>{stats.devlogs}</span>
            <span className={styles.statLabel}>Devlog Entries</span>
          </div>
        </div>

        {/* Navigation cards */}
        <div className={styles.navGrid}>
          <button
            className={styles.navCard}
            onClick={() => router.push('/admin/projects')}
          >
            <h3>Projects</h3>
            <p>Add, edit and manage your portfolio projects</p>
          </button>

          <button
            className={styles.navCard}
            onClick={() => router.push('/admin/skills')}
          >
            <h3>Skills</h3>
            <p>Manage your skills and tech stack</p>
          </button>

          <button
            className={styles.navCard}
            onClick={() => router.push('/admin/settings')}
          >
            <h3>Socials & Contact</h3>
            <p>Update your email, GitHub, LinkedIn and other links</p>
          </button>

          <button
            className={styles.navCard}
            onClick={() => router.push('/')}
          >
            <h3>View Site →</h3>
            <p>See the public facing portfolio</p>
          </button>
        </div>

      </main>
    </div>
  )
}