import { Card } from '@/components/ui/card'
import { Monitor, Layout, CreditCard, ListChecks, Table, AppWindow, Article, ShoppingCart, UserCircle, ChartBar } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

export type PreviewMode = 'landing' | 'dashboard' | 'card' | 'form' | 'components' | 'table' | 'blog' | 'ecommerce' | 'profile' | 'analytics'

interface PreviewSelectorProps {
  value: PreviewMode
  onChange: (mode: PreviewMode) => void
}

const previewModes = [
  {
    id: 'landing' as PreviewMode,
    name: 'Landing Page',
    icon: Monitor,
    description: 'Hero section with CTA',
    color: 'bg-blue-500'
  },
  {
    id: 'dashboard' as PreviewMode,
    name: 'Dashboard',
    icon: Layout,
    description: 'Sidebar with content',
    color: 'bg-purple-500'
  },
  {
    id: 'card' as PreviewMode,
    name: 'Product Card',
    icon: CreditCard,
    description: 'E-commerce card',
    color: 'bg-pink-500'
  },
  {
    id: 'form' as PreviewMode,
    name: 'Form',
    icon: ListChecks,
    description: 'Input fields & buttons',
    color: 'bg-green-500'
  },
  {
    id: 'components' as PreviewMode,
    name: 'Components',
    icon: AppWindow,
    description: 'UI component library',
    color: 'bg-orange-500'
  },
  {
    id: 'table' as PreviewMode,
    name: 'Data Table',
    icon: Table,
    description: 'Interactive table',
    color: 'bg-cyan-500'
  },
  {
    id: 'blog' as PreviewMode,
    name: 'Blog Post',
    icon: Article,
    description: 'Article layout',
    color: 'bg-indigo-500'
  },
  {
    id: 'ecommerce' as PreviewMode,
    name: 'E-commerce',
    icon: ShoppingCart,
    description: 'Product listing',
    color: 'bg-red-500'
  },
  {
    id: 'profile' as PreviewMode,
    name: 'Profile',
    icon: UserCircle,
    description: 'User profile page',
    color: 'bg-teal-500'
  },
  {
    id: 'analytics' as PreviewMode,
    name: 'Analytics',
    icon: ChartBar,
    description: 'Charts & metrics',
    color: 'bg-amber-500'
  },
]

export function PreviewSelector({ value, onChange }: PreviewSelectorProps) {
  return (
    <div className="space-y-2">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Preview Template
      </h3>
      <div className="max-h-[280px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
        <div className="grid grid-cols-2 gap-2">
          {previewModes.map((mode) => {
            const Icon = mode.icon
            const isSelected = value === mode.id
            
            return (
              <button
                key={mode.id}
                className={cn(
                  'relative cursor-pointer transition-all p-2.5 rounded-lg border text-left',
                  'hover:scale-[1.02] active:scale-[0.98]',
                  isSelected
                    ? 'border-primary bg-accent/50 shadow-sm'
                    : 'border-border/50 hover:border-border hover:bg-accent/30'
                )}
                onClick={() => onChange(mode.id)}
              >
                <div className="flex items-center gap-2.5">
                  <div className={cn(
                    'w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0',
                    isSelected ? mode.color + '/20' : 'bg-muted'
                  )}>
                    <Icon 
                      size={16} 
                      weight={isSelected ? 'fill' : 'regular'}
                      className={cn(
                        isSelected ? mode.color.replace('bg-', 'text-') : 'text-muted-foreground'
                      )}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={cn(
                      'text-xs font-medium truncate',
                      isSelected ? 'text-foreground' : 'text-muted-foreground'
                    )}>
                      {mode.name}
                    </div>
                    <div className="text-[10px] text-muted-foreground truncate">
                      {mode.description}
                    </div>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
