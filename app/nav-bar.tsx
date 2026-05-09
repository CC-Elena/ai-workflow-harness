'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navLinks = [
  { href: '/', label: '首页' },
  { href: '/files', label: '文件列表' }
];

export default function NavBar() {
  const pathname = usePathname();

  return (
    <nav className="nav-bar">
      <Link href="/" className="nav-bar-logo" aria-label="AI Workflow Harness">
        W
      </Link>
      {navLinks.map((link) => {
        const isActive = link.href === '/' ? pathname === '/' : pathname.startsWith(link.href);
        return (
          <Link key={link.href} href={link.href} className={isActive ? 'nav-active' : ''}>
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
