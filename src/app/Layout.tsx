import { NavLink, Outlet } from 'react-router'
import { navItems } from './routes'
import { UpdateBanner } from './UpdateBanner'
import { useUpdateCheck } from './useUpdateCheck'

const linkClass = ({ isActive }: { isActive: boolean }) =>
  [
    'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
    isActive ? 'bg-surface-2 text-accent-strong' : 'text-muted hover:bg-surface-2 hover:text-text',
  ].join(' ')

const tabClass = ({ isActive }: { isActive: boolean }) =>
  [
    'flex flex-1 flex-col items-center gap-0.5 py-2 text-xs',
    isActive ? 'text-accent-strong' : 'text-muted',
  ].join(' ')

export function Layout() {
  useUpdateCheck()
  return (
    <div className="flex h-full">
      <aside className="hidden w-56 shrink-0 flex-col gap-1 border-r border-border bg-surface p-4 md:flex">
        <div className="mb-4 px-3 text-lg font-semibold text-accent">Lost Ark Planner</div>
        {navItems.map((item) => (
          <NavLink key={item.path} to={item.path} className={linkClass}>
            <span aria-hidden>{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </aside>

      <main className="flex-1 overflow-y-auto px-4 pt-6 pb-24 md:px-8 md:pb-8">
        <div className="mx-auto max-w-5xl">
          <UpdateBanner />
          <Outlet />
        </div>
      </main>

      <nav className="fixed inset-x-0 bottom-0 flex border-t border-border bg-surface md:hidden">
        {navItems.map((item) => (
          <NavLink key={item.path} to={item.path} className={tabClass}>
            <span aria-hidden className="text-lg">
              {item.icon}
            </span>
            {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
