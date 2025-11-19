import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Keyboard } from '@phosphor-icons/react'
import { Card } from '@/components/ui/card'

interface KeyboardShortcutsHelpProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function KeyboardShortcutsHelp({ open, onOpenChange }: KeyboardShortcutsHelpProps) {
  const isMac = typeof navigator !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  const cmdKey = isMac ? '⌘' : 'Ctrl';

  const shortcuts = [
    { category: 'Navigation', items: [
      { keys: ['1'], description: 'Go to Upload' },
      { keys: ['2'], description: 'Go to Colors' },
      { keys: ['3'], description: 'Go to Gradients' },
      { keys: ['4'], description: 'Go to Palettes' },
      { keys: ['5'], description: 'Go to Analysis' },
      { keys: ['6'], description: 'Go to Accessibility' },
      { keys: ['7'], description: 'Go to Tools' },
      { keys: ['8'], description: 'Go to Preview' },
      { keys: ['9'], description: 'Go to Export' },
      { keys: ['0'], description: 'Go to Collections' },
      { keys: ['H'], description: 'Go to History' },
      { keys: ['←', '→'], description: 'Navigate between views' },
    ]},
    { category: 'Actions', items: [
      { keys: [cmdKey, 'U'], description: 'Upload image' },
      { keys: [cmdKey, 'D'], description: 'Toggle dark mode' },
      { keys: [cmdKey, 'K'], description: 'Clear current image' },
      { keys: [cmdKey, 'S'], description: 'Save to collections' },
      { keys: [cmdKey, 'E'], description: 'Export theme' },
      { keys: [cmdKey, 'N'], description: 'New analysis' },
      { keys: [cmdKey, 'C'], description: 'Copy current colors' },
      { keys: [cmdKey, 'Shift', 'S'], description: 'Share palette' },
      { keys: ['?'], description: 'Show shortcuts' },
      { keys: ['Esc'], description: 'Close dialogs' },
    ]},
    { category: 'Editing', items: [
      { keys: [cmdKey, 'Z'], description: 'Undo' },
      { keys: [cmdKey, 'Shift', 'Z'], description: 'Redo' },
      { keys: [cmdKey, 'Y'], description: 'Redo (alternative)' },
    ]},
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard size={20} weight="duotone" className="text-accent" />
            Keyboard Shortcuts
          </DialogTitle>
          <DialogDescription>
            Use these shortcuts to navigate and work faster
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
          {shortcuts.map((section) => (
            <div key={section.category} className="space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                {section.category}
              </h3>
              <Card className="p-3">
                <div className="space-y-2.5">
                  {section.items.map((item, index) => (
                    <div key={index} className="flex flex-col gap-1.5">
                      <span className="text-sm text-foreground font-medium">{item.description}</span>
                      <div className="flex gap-1 flex-wrap">
                        {item.keys.map((key, keyIndex) => (
                          <kbd
                            key={keyIndex}
                            className="px-2 py-0.5 text-xs font-semibold text-foreground bg-muted border border-border rounded"
                          >
                            {key}
                          </kbd>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
