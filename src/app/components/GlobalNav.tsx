'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import styles from './GlobalNav.module.css'

export default function GlobalNav() {
  const pathname = usePathname()
  const [userRole, setUserRole] = useState<'user' | 'admin'>('user')

  useEffect(() => {
    // Verificar rol de usuario
    const role = localStorage.getItem('neoproxy_role') as 'user' | 'admin' || 'user'
    setUserRole(role)
  }, [])

  const navItems = [
    { href: '/', label: 'HOME', icon: '⚡' },
    { href: '/portal', label: 'PORTAL', icon: '🌀' },
    { href: '/ar', label: 'AR_COMBAT', icon: '🔫' },
    { href: '/espada', label: 'ESPADA', icon: '⚔️' },
    { href: '/shop', label: 'SHOP', icon: '🛒' },
    { href: '/npos', label: 'NPOS_OS', icon: '⚙️' },
    { href: '/npos/memory', label: 'MEMORY', icon: '🧠' },
    { href: '/artifacts', label: 'ARTIFACTS', icon: '🏺' },
    { href: '/kernel', label: 'KERNEL', icon: '🧊' },
    { href: '/system', label: 'SYSTEM', icon: '🧬' },
    { href: '/network', label: 'NETWORK', icon: '🌐' },
    { href: '/manifesto', label: 'MANIFESTO', icon: '📜' },
  ]

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <nav className={styles.globalNav}>
      <div className={styles.navContainer}>
        <div className={styles.navHeader}>
          <div className={styles.logo}>
            <span className={styles.neo}>NEO</span><span className={styles.proxy}>PROXY</span>
          </div>
          <div className={styles.version}>v0.2</div>
        </div>
        
        <div className={styles.navMenu}>
          {navItems.map(item => (
            <Link 
              key={item.href}
              href={item.href}
              className={`${styles.navItem} ${isActive(item.href) ? styles.active : ''}`}
            >
              <span className={styles.navIcon}>{item.icon}</span>
              <span className={styles.navLabel}>{item.label}</span>
              <span className={styles.navIndicator} />
            </Link>
          ))}
        </div>

        <div className={styles.navFooter}>
          <div className={styles.status}>
            <span className={styles.statusDot} />
            <span className={styles.statusText}>SYSTEM_ONLINE</span>
          </div>
          <div className={styles.operator}>OPERATOR: darkproxy</div>
        </div>
      </div>
    </nav>
  )
}
