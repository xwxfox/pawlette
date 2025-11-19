import { useState } from 'react'
import { ClockCounterClockwise, MagnifyingGlass, X, Trash, Swatches } from '@phosphor-icons/react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import type { ColorAnalysis } from '@/lib/types'

interface AnalysisHistoryProps {
  history: ColorAnalysis[]
  onRestore: (analysis: ColorAnalysis) => void
  onClearHistory?: () => void
}

export function AnalysisHistory({ history, onRestore, onClearHistory }: AnalysisHistoryProps) {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredHistory = history.filter(analysis =>
    analysis.imageName.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (history.length === 0) {
    return (
      <Card className="p-12 text-center">
        <ClockCounterClockwise size={64} weight="duotone" className="mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-semibold mb-2">No history yet</h3>
        <p className="text-sm text-muted-foreground">
          Upload and analyze your first image to start building your history
        </p>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <ClockCounterClockwise size={24} weight="duotone" className="text-accent" />
          <h2 className="text-xl font-semibold">Recent Analyses</h2>
        </div>
        {onClearHistory && history.length > 0 && (
          <Button variant="outline" size="sm" onClick={onClearHistory}>
            <Trash size={16} className="mr-2" />
            Clear All
          </Button>
        )}
      </div>

      <div className="relative">
        <MagnifyingGlass size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by filename..."
          className="pl-10 pr-10"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {filteredHistory.length === 0 ? (
        <Card className="p-12 text-center">
          <MagnifyingGlass size={48} weight="duotone" className="mx-auto mb-3 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            No analyses found matching "{searchQuery}"
          </p>
        </Card>
      ) : (
        <ScrollArea className="h-[600px]">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pr-4">
            {filteredHistory.map((analysis) => (
              <Card
                key={analysis.id}
                className="overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105"
                onClick={() => onRestore(analysis)}
              >
                {analysis.imageUrl ? (
                  <img
                    src={analysis.imageUrl}
                    alt={analysis.imageName}
                    className="w-full h-32 object-cover"
                  />
                ) : (
                  <div className="w-full h-32 bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                    <Swatches size={32} weight="duotone" className="text-muted-foreground/50" />
                  </div>
                )}
                <div className="p-3">
                  <p className="text-sm font-medium truncate mb-2">{analysis.imageName}</p>
                  <div className="flex gap-1 mb-2">
                    {analysis.dominantColors.slice(0, 5).map((color, index) => (
                      <div
                        key={index}
                        className="flex-1 h-4 rounded"
                        style={{ backgroundColor: color.hex }}
                        title={color.hex}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {new Date(analysis.timestamp).toLocaleDateString()}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  )
}
