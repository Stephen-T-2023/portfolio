/* ============================================
   Navbar.jsx
   Ashborne Portfolio
   Public facing navigation bar. Sits on every
   portfolio page. Contains logo, nav links
   and dark mode toggle.
   ============================================ */

import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import styles from '../styles/Navbar.module.css'

export default function Navbar() {
  const router = useRouter()
  const [theme, setTheme] = useState('light')
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const savedTheme = localStorage.getItem('ashborne-theme') || 'light'
    setTheme(savedTheme)
  }, [])

  /* Close menu on route change */
  useEffect(() => {
    const timer = setTimeout(() => setMenuOpen(false), 0)
    return () => clearTimeout(timer)
  }, [router.pathname])

  function handleThemeToggle() {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    document.documentElement.setAttribute('data-theme', newTheme)
    localStorage.setItem('ashborne-theme', newTheme)
  }

  function navigate(path) {
    setMenuOpen(false)
    router.push(path)
  }

  /* Hide navbar on admin pages */
  if (router.pathname.startsWith('/admin')) return null

  return (
    <>
      <nav className={styles.navbar}>
        <button
          className={styles.logo}
          onClick={() => router.push('/')}
        >
          Ashborne
        </button>

        {/* Desktop nav links */}
        <div className={styles.links}>
          <button
            className={`${styles.link} ${router.pathname === '/projects' ? styles.active : ''}`}
            onClick={() => navigate('/projects')}
          >
            Projects
          </button>
          <button
            className={`${styles.link} ${router.pathname === '/about' ? styles.active : ''}`}
            onClick={() => navigate('/about')}
          >
            About
          </button>
          <button
            className={`${styles.link} ${router.pathname === '/contact' ? styles.active : ''}`}
            onClick={() => navigate('/contact')}
          >
            Contact
          </button>
        </div>

        <div className={styles.right}>
          {/* Dark mode toggle */}
          <button
            className={styles.themeToggle}
            onClick={handleThemeToggle}
            aria-label="Toggle dark mode"
          >
            {theme === 'light' ? '●' : '○'}
          </button>
        </div>

        {/* Hamburger — mobile only */}
        <button
          className={styles.hamburger}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Open menu"
        >
          {menuOpen ? '✕' : '☰'}
        </button>
      </nav>

      {/* Mobile menu */}
      <div className={`${styles.mobileMenu} ${menuOpen ? styles.open : ''}`}>
        <div className={styles.mobileNav}>
          <button className={styles.mobileNavButton} onClick={() => navigate('/')}>
            Home
          </button>
          <button className={styles.mobileNavButton} onClick={() => navigate('/projects')}>
            Projects
          </button>
          <button className={styles.mobileNavButton} onClick={() => navigate('/about')}>
            About
          </button>
          <button className={styles.mobileNavButton} onClick={() => navigate('/contact')}>
            Contact
          </button>
          <button className={styles.mobileNavButton} onClick={handleThemeToggle}>
            {theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
          </button>
        </div>
      </div>
    </>
  )
}