import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { Slider } from './ui/slider';
import { Button } from './ui/button';
import { Copy, Check } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { generateTintShadeScale } from '@/lib/colorManipulation';
import type { ExtractedColor } from '@/lib/types';

interface TintShadeGeneratorProps {
  colors: ExtractedColor[];
}

export function TintShadeGenerator({ colors }: TintShadeGeneratorProps) {
  const [baseColor, setBaseColor] = useState(colors[0]?.hex || '#6366F1');
  const [tintCount, setTintCount] = useState(5);
  const [shadeCount, setShadeCount] = useState(5);
  const [copiedColor, setCopiedColor] = useState<string | null>(null);

  const { tints, base, shades } = generateTintShadeScale(baseColor, tintCount, shadeCount);
  const allColors = [...tints, base, ...shades];

  const copyColor = (color: string) => {
    navigator.clipboard.writeText(color);
    setCopiedColor(color);
    setTimeout(() => setCopiedColor(null), 2000);
    toast.success('Color copied!');
  };

  const copyAll = () => {
    const colorsList = allColors.join(', ');
    navigator.clipboard.writeText(colorsList);
    toast.success('All colors copied!');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tint & Shade Generator</CardTitle>
        <CardDescription>
          Generate lighter (tints) and darker (shades) variations of a color
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Base Color Selector */}
        <div className="space-y-2">
          <Label>Base Color</Label>
          <div className="grid grid-cols-6 gap-2">
            {colors.map((color) => (
              <button
                key={color.hex}
                onClick={() => setBaseColor(color.hex)}
                className={`h-12 rounded-md border-2 transition-all ${
                  baseColor === color.hex
                    ? 'border-accent-9 ring-2 ring-accent-9 ring-offset-2'
                    : 'border-neutral-6 hover:border-neutral-8'
                }`}
                style={{ backgroundColor: color.hex }}
                title={color.hex}
              />
            ))}
          </div>
          <div
            className="h-16 rounded-md border flex items-center justify-center font-mono text-sm"
            style={{ backgroundColor: baseColor, color: '#fff', textShadow: '0 0 2px rgba(0,0,0,0.5)' }}
          >
            {baseColor}
          </div>
        </div>

        {/* Tint Count Slider */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Number of Tints (Lighter)</Label>
            <span className="text-sm text-fg-secondary">{tintCount}</span>
          </div>
          <Slider
            value={[tintCount]}
            onValueChange={(value) => setTintCount(value[0])}
            min={1}
            max={10}
            step={1}
          />
        </div>

        {/* Shade Count Slider */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Number of Shades (Darker)</Label>
            <span className="text-sm text-fg-secondary">{shadeCount}</span>
          </div>
          <Slider
            value={[shadeCount]}
            onValueChange={(value) => setShadeCount(value[0])}
            min={1}
            max={10}
            step={1}
          />
        </div>

        {/* Tints Display */}
        <div className="space-y-2">
          <Label>Tints (Lighter Variations)</Label>
          <div className="grid grid-cols-5 gap-2">
            {tints.map((color, index) => (
              <button
                key={index}
                onClick={() => copyColor(color)}
                className="group relative h-20 rounded-md border hover:border-accent-9 transition-all overflow-hidden"
                style={{ backgroundColor: color }}
                title={color}
              >
                <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 bg-black/50 text-white transition-opacity">
                  <Copy className="h-4 w-4 mb-1" />
                  <span className="text-xs font-mono">{color}</span>
                </div>
                {copiedColor === color && (
                  <div className="absolute top-1 right-1">
                    <Check className="h-4 w-4 text-white" weight="bold" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Base Color Display */}
        <div className="space-y-2">
          <Label>Base Color</Label>
          <button
            onClick={() => copyColor(base)}
            className="group relative w-full h-20 rounded-md border-2 border-accent-9 hover:border-accent-10 transition-all overflow-hidden"
            style={{ backgroundColor: base }}
            title={base}
          >
            <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 bg-black/50 text-white transition-opacity">
              <Copy className="h-5 w-5 mb-1" />
              <span className="text-sm font-mono">{base}</span>
            </div>
            {copiedColor === base && (
              <div className="absolute top-2 right-2">
                <Check className="h-5 w-5 text-white" weight="bold" />
              </div>
            )}
          </button>
        </div>

        {/* Shades Display */}
        <div className="space-y-2">
          <Label>Shades (Darker Variations)</Label>
          <div className="grid grid-cols-5 gap-2">
            {shades.map((color, index) => (
              <button
                key={index}
                onClick={() => copyColor(color)}
                className="group relative h-20 rounded-md border hover:border-accent-9 transition-all overflow-hidden"
                style={{ backgroundColor: color }}
                title={color}
              >
                <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 bg-black/50 text-white transition-opacity">
                  <Copy className="h-4 w-4 mb-1" />
                  <span className="text-xs font-mono">{color}</span>
                </div>
                {copiedColor === color && (
                  <div className="absolute top-1 right-1">
                    <Check className="h-4 w-4 text-white" weight="bold" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Complete Scale Visualization */}
        <div className="space-y-2">
          <Label>Complete Scale ({allColors.length} colors)</Label>
          <div className="flex rounded-md overflow-hidden border h-12">
            {allColors.map((color, index) => (
              <div
                key={index}
                className="flex-1 cursor-pointer hover:opacity-80 transition-opacity"
                style={{ backgroundColor: color }}
                onClick={() => copyColor(color)}
                title={color}
              />
            ))}
          </div>
        </div>

        {/* Copy All Button */}
        <Button variant="outline" className="w-full" onClick={copyAll}>
          <Copy className="h-4 w-4 mr-2" />
          Copy All {allColors.length} Colors
        </Button>

        {/* CSS Variables Output */}
        <div className="space-y-2">
          <Label>CSS Variables</Label>
          <pre className="p-4 rounded-md bg-neutral-2 overflow-x-auto text-xs">
            <code>
              {tints.map((color, i) => `--color-${100 * (tints.length - i)}: ${color};\n`).join('')}
              {`--color-500: ${base};\n`}
              {shades.map((color, i) => `--color-${600 + i * 100}: ${color};\n`).join('')}
            </code>
          </pre>
        </div>
      </CardContent>
    </Card>
  );
}
