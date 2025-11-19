import React, { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { toast } from 'sonner';
import {
  Trash,
  DownloadSimple,
  Share,
  Upload,
  Plus,
  MagnifyingGlass,
  Package,
  Check,
} from '@phosphor-icons/react';
import {
  exportPalettesAsZip,
  importPaletteFromJson,
  type ShareablePalette,
} from '@/lib/shareUtils';
import { ShareModal } from './ShareModal';

interface PaletteCollectionsProps {
  collections: ShareablePalette[];
  onAdd: (palette: ShareablePalette) => void;
  onRemove: (index: number) => void;
  onLoad: (palette: ShareablePalette) => void;
}

export function PaletteCollections({
  collections,
  onAdd,
  onRemove,
  onLoad,
}: PaletteCollectionsProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [selectedPalette, setSelectedPalette] = useState<ShareablePalette | null>(null);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [loadedPalette, setLoadedPalette] = useState<number | null>(null);

  const filteredCollections = collections.filter((palette) =>
    palette.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleExportAll = async () => {
    if (collections.length === 0) {
      toast.error('No palettes to export');
      return;
    }

    try {
      await exportPalettesAsZip(collections);
      toast.success(`Exported ${collections.length} palette(s) as ZIP!`);
    } catch (error) {
      toast.error('Failed to export palettes');
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const palette = await importPaletteFromJson(file);
      if (palette) {
        onAdd(palette);
        toast.success(`Imported "${palette.name}"!`);
        setImportDialogOpen(false);
      } else {
        toast.error('Invalid palette file');
      }
    } catch (error) {
      toast.error('Failed to import palette');
    }

    // Reset file input
    event.target.value = '';
  };

  const handleShare = (palette: ShareablePalette) => {
    setSelectedPalette(palette);
    setShareModalOpen(true);
  };

  const handleLoad = (palette: ShareablePalette, index: number) => {
    onLoad(palette);
    setLoadedPalette(index);
    setTimeout(() => setLoadedPalette(null), 2000);
    toast.success(`Loaded "${palette.name}"!`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search collections..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex gap-2">
          <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Upload className="w-4 h-4 mr-2" />
                Import
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Import Palette</DialogTitle>
                <DialogDescription>
                  Upload a JSON file to add a palette to your collection
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="border-2 border-dashed rounded-lg p-8 text-center hover:bg-accent/50 transition-colors">
                  <Input
                    type="file"
                    accept=".json"
                    onChange={handleImport}
                    className="hidden"
                    id="import-file"
                  />
                  <label htmlFor="import-file" className="cursor-pointer">
                    <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm font-medium">Click to upload JSON file</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Or drag and drop a palette file
                    </p>
                  </label>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Button variant="outline" onClick={handleExportAll} disabled={collections.length === 0}>
            <Package className="w-4 h-4 mr-2" />
            Export All
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="text-2xl font-bold">{collections.length}</div>
          <div className="text-sm text-muted-foreground">Total Palettes</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold">
            {collections.reduce((sum, p) => sum + p.colors.length, 0)}
          </div>
          <div className="text-sm text-muted-foreground">Total Colors</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold">
            {collections.filter(p => p.customGradients && p.customGradients.length > 0).length}
          </div>
          <div className="text-sm text-muted-foreground">With Gradients</div>
        </Card>
      </div>

      <Separator />

      {/* Collections Grid */}
      {filteredCollections.length === 0 ? (
        <Card className="p-12 text-center">
          <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">
            {searchQuery ? 'No palettes found' : 'No saved palettes'}
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            {searchQuery
              ? 'Try a different search term'
              : 'Palettes you save will appear here'}
          </p>
          {!searchQuery && (
            <Button variant="outline" onClick={() => setImportDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Import Palette
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredCollections.map((palette, index) => (
            <Card key={index} className="p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold">{palette.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary" className="text-xs">
                      {palette.colors.length} colors
                    </Badge>
                    {palette.customGradients && palette.customGradients.length > 0 && (
                      <Badge variant="outline" className="text-xs">
                        {palette.customGradients.length} gradients
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">
                  {new Date(palette.createdAt).toLocaleDateString()}
                </div>
              </div>

              {/* Color Preview */}
              <div className="flex rounded-lg overflow-hidden border h-16">
                {palette.colors.slice(0, 8).map((color, colorIndex) => (
                  <div
                    key={colorIndex}
                    className="flex-1 relative group"
                    style={{ backgroundColor: color.hex }}
                    title={color.hex}
                  />
                ))}
                {palette.colors.length > 8 && (
                  <div className="w-16 flex items-center justify-center bg-muted text-muted-foreground text-xs font-medium">
                    +{palette.colors.length - 8}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  variant="default"
                  size="sm"
                  className="flex-1"
                  onClick={() => handleLoad(palette, index)}
                >
                  {loadedPalette === index ? (
                    <Check className="w-4 h-4 mr-2" />
                  ) : (
                    <DownloadSimple className="w-4 h-4 mr-2" />
                  )}
                  Load
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleShare(palette)}
                >
                  <Share className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    onRemove(collections.indexOf(palette));
                    toast.success('Palette removed');
                  }}
                >
                  <Trash className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Share Modal */}
      {selectedPalette && (
        <ShareModal
          open={shareModalOpen}
          onOpenChange={setShareModalOpen}
          palette={selectedPalette}
        />
      )}
    </div>
  );
}
