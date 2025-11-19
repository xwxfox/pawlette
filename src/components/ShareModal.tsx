import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Card } from './ui/card';
import { Separator } from './ui/separator';
import { toast } from 'sonner';
import {
  Link,
  QrCode,
  DownloadSimple,
  Copy,
  Check,
  Image as ImageIcon,
  FileJs,
  Package,
} from '@phosphor-icons/react';
import {
  generateShareUrl,
  generateQRCode,
  exportPaletteAsJson,
  downloadPalettePreview,
  copyToClipboard,
  type ShareablePalette,
} from '@/lib/shareUtils';

interface ShareModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  palette: ShareablePalette;
}

export function ShareModal({ open, onOpenChange, palette }: ShareModalProps) {
  const [shareUrl, setShareUrl] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [isGeneratingQR, setIsGeneratingQR] = useState(false);

  useEffect(() => {
    if (open) {
      const url = generateShareUrl(palette);
      setShareUrl(url);
      generateQR(url);
    }
  }, [open, palette]);

  const generateQR = async (url: string) => {
    setIsGeneratingQR(true);
    try {
      const qr = await generateQRCode(url);
      setQrCodeUrl(qr);
    } catch (error) {
      toast.error('Failed to generate QR code');
    } finally {
      setIsGeneratingQR(false);
    }
  };

  const handleCopyUrl = async () => {
    const success = await copyToClipboard(shareUrl);
    if (success) {
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } else {
      toast.error('Failed to copy link');
    }
  };

  const handleExportJson = () => {
    try {
      exportPaletteAsJson(palette);
      toast.success('Palette exported as JSON!');
    } catch (error) {
      toast.error('Failed to export palette');
    }
  };

  const handleDownloadPreview = async () => {
    try {
      await downloadPalettePreview(palette);
      toast.success('Preview image downloaded!');
    } catch (error) {
      toast.error('Failed to download preview');
    }
  };

  const handleDownloadQR = () => {
    if (!qrCodeUrl) return;

    const link = document.createElement('a');
    link.href = qrCodeUrl;
    link.download = `${palette.name.toLowerCase().replace(/\s+/g, '-')}-qr.png`;
    link.click();
    toast.success('QR code downloaded!');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Share Palette</DialogTitle>
          <DialogDescription>
            Share "{palette.name}" with {palette.colors.length} colors
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="link" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="link">
              <Link className="w-4 h-4 mr-2" />
              Link
            </TabsTrigger>
            <TabsTrigger value="qr">
              <QrCode className="w-4 h-4 mr-2" />
              QR Code
            </TabsTrigger>
            <TabsTrigger value="export">
              <DownloadSimple className="w-4 h-4 mr-2" />
              Export
            </TabsTrigger>
            <TabsTrigger value="embed">
              <Package className="w-4 h-4 mr-2" />
              Embed
            </TabsTrigger>
          </TabsList>

          {/* Link Tab */}
          <TabsContent value="link" className="space-y-4">
            <Card className="p-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="share-url">Share URL</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      id="share-url"
                      value={shareUrl}
                      readOnly
                      className="font-mono text-sm"
                    />
                    <Button onClick={handleCopyUrl} variant="outline" size="icon">
                      {copied ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Anyone with this link can view and import your palette
                  </p>
                </div>

                <Separator />

                <div>
                  <h4 className="font-semibold mb-3">Palette Preview</h4>
                  <div className="flex rounded-lg overflow-hidden border h-24">
                    {palette.colors.map((color, index) => (
                      <div
                        key={index}
                        className="flex-1 relative group"
                        style={{ backgroundColor: color.hex }}
                        title={color.hex}
                      >
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                          <span className="text-white text-xs font-mono drop-shadow">
                            {color.hex}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="text-sm">
                    <span className="text-muted-foreground">Colors:</span>{' '}
                    <span className="font-medium">{palette.colors.length}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">Created:</span>{' '}
                    <span className="font-medium">
                      {new Date(palette.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* QR Code Tab */}
          <TabsContent value="qr" className="space-y-4">
            <Card className="p-6">
              <div className="space-y-4">
                <div className="text-center">
                  {isGeneratingQR ? (
                    <div className="flex items-center justify-center h-64">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : qrCodeUrl ? (
                    <div className="space-y-4">
                      <img
                        src={qrCodeUrl}
                        alt="QR Code"
                        className="mx-auto border rounded-lg p-4 bg-white"
                        style={{ width: '300px', height: '300px' }}
                      />
                      <p className="text-sm text-muted-foreground">
                        Scan this QR code to open the palette
                      </p>
                      <Button onClick={handleDownloadQR} variant="outline" className="w-full">
                        <DownloadSimple className="w-4 h-4 mr-2" />
                        Download QR Code
                      </Button>
                    </div>
                  ) : (
                    <div className="text-muted-foreground py-8">
                      Failed to generate QR code
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Export Tab */}
          <TabsContent value="export" className="space-y-4">
            <Card className="p-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors cursor-pointer"
                     onClick={handleExportJson}>
                  <FileJs className="w-5 h-5 mt-0.5 text-primary" />
                  <div className="flex-1">
                    <h4 className="font-semibold">Export as JSON</h4>
                    <p className="text-sm text-muted-foreground">
                      Download palette data as a JSON file for backup or sharing
                    </p>
                  </div>
                  <Button variant="ghost" size="sm">
                    <DownloadSimple className="w-4 h-4" />
                  </Button>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors cursor-pointer"
                     onClick={handleDownloadPreview}>
                  <ImageIcon className="w-5 h-5 mt-0.5 text-primary" />
                  <div className="flex-1">
                    <h4 className="font-semibold">Download Preview Image</h4>
                    <p className="text-sm text-muted-foreground">
                      Export palette as a PNG image for presentations or social media
                    </p>
                  </div>
                  <Button variant="ghost" size="sm">
                    <DownloadSimple className="w-4 h-4" />
                  </Button>
                </div>

                <Separator />

                <div className="text-xs text-muted-foreground space-y-1">
                  <p><strong>JSON format:</strong> Complete palette data including theme config and gradients</p>
                  <p><strong>PNG format:</strong> Visual representation with color codes</p>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Embed Tab */}
          <TabsContent value="embed" className="space-y-4">
            <Card className="p-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="embed-html">HTML Embed Code</Label>
                  <textarea
                    id="embed-html"
                    readOnly
                    value={`<div style="display: flex; height: 100px; border-radius: 8px; overflow: hidden;">
${palette.colors.map(c => `  <div style="flex: 1; background-color: ${c.hex};" title="${c.hex}"></div>`).join('\n')}
</div>`}
                    className="w-full h-32 mt-2 p-3 font-mono text-xs bg-muted rounded-lg border resize-none"
                    onClick={(e) => e.currentTarget.select()}
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    Copy this HTML code to embed the palette on your website
                  </p>
                </div>

                <Separator />

                <div>
                  <Label htmlFor="embed-css">CSS Variables</Label>
                  <textarea
                    id="embed-css"
                    readOnly
                    value={`:root {
${palette.colors.map((c, i) => `  --color-${i + 1}: ${c.hex};`).join('\n')}
}`}
                    className="w-full h-32 mt-2 p-3 font-mono text-xs bg-muted rounded-lg border resize-none"
                    onClick={(e) => e.currentTarget.select()}
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    Use these CSS custom properties in your stylesheets
                  </p>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
