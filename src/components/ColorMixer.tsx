import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { Slider } from './ui/slider';
import { Button } from './ui/button';
import { Copy, Check } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { mixColors, generateColorScale } from '@/lib/colorManipulation';
import type { ExtractedColor } from '@/lib/types';

interface ColorMixerProps {
  colors: ExtractedColor[];
}

export function ColorMixer({ colors }: ColorMixerProps) {
  const [color1, setColor1] = useState(colors[0]?.hex || '#FF0000');
  const [color2, setColor2] = useState(colors[colors.length - 1]?.hex || '#0000FF');
  const [mixRatio, setMixRatio] = useState(50);
  const [scaleSteps, setScaleSteps] = useState(7);
  const [copiedColor, setCopiedColor] = useState<string | null>(null);

  const mixedColor = mixColors(color1, color2, mixRatio / 100);
  const colorScale = generateColorScale(color1, color2, scaleSteps);

  const copyColor = (color: string) => {
    navigator.clipboard.writeText(color);
    setCopiedColor(color);
    setTimeout(() => setCopiedColor(null), 2000);
    toast.success('Color copied!');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Color Mixer</CardTitle>
        <CardDescription>
          Mix two colors together and generate color scales
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Color Selectors */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>First Color</Label>
            <div className="grid grid-cols-4 gap-2">
              {colors.map((color) => (
                <button
                  key={color.hex}
                  onClick={() => setColor1(color.hex)}
                  className={`h-12 rounded-md border-2 transition-all ${
                    color1 === color.hex
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
              style={{ backgroundColor: color1, color: '#fff', textShadow: '0 0 2px rgba(0,0,0,0.5)' }}
            >
              {color1}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Second Color</Label>
            <div className="grid grid-cols-4 gap-2">
              {colors.map((color) => (
                <button
                  key={color.hex}
                  onClick={() => setColor2(color.hex)}
                  className={`h-12 rounded-md border-2 transition-all ${
                    color2 === color.hex
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
              style={{ backgroundColor: color2, color: '#fff', textShadow: '0 0 2px rgba(0,0,0,0.5)' }}
            >
              {color2}
            </div>
          </div>
        </div>

        {/* Mix Ratio Slider */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Mix Ratio</Label>
            <span className="text-sm text-fg-secondary">{mixRatio}%</span>
          </div>
          <Slider
            value={[mixRatio]}
            onValueChange={(value) => setMixRatio(value[0])}
            min={0}
            max={100}
            step={1}
          />
          <div className="flex justify-between text-xs text-fg-secondary">
            <span>100% First</span>
            <span>50/50</span>
            <span>100% Second</span>
          </div>
        </div>

        {/* Mixed Result */}
        <div className="space-y-2">
          <Label>Mixed Color</Label>
          <div className="flex gap-2">
            <div
              className="flex-1 h-20 rounded-md border flex items-center justify-center font-mono text-sm"
              style={{ backgroundColor: mixedColor, color: '#fff', textShadow: '0 0 2px rgba(0,0,0,0.5)' }}
            >
              {mixedColor}
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => copyColor(mixedColor)}
              className="h-20 w-20"
            >
              {copiedColor === mixedColor ? (
                <Check className="h-5 w-5" />
              ) : (
                <Copy className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Color Scale Generator */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Generate Color Scale</Label>
            <span className="text-sm text-fg-secondary">{scaleSteps} colors</span>
          </div>
          <Slider
            value={[scaleSteps]}
            onValueChange={(value) => setScaleSteps(value[0])}
            min={3}
            max={11}
            step={2}
          />
        </div>

        {/* Color Scale Display */}
        <div className="space-y-2">
          <Label>Color Scale</Label>
          <div className="flex gap-1 rounded-md overflow-hidden border">
            {colorScale.map((color, index) => (
              <button
                key={index}
                onClick={() => copyColor(color)}
                className="flex-1 h-16 hover:opacity-80 transition-opacity group relative"
                style={{ backgroundColor: color }}
                title={color}
              >
                <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/50 text-white text-xs font-mono transition-opacity">
                  {color}
                </span>
              </button>
            ))}
          </div>
          <p className="text-xs text-fg-secondary">Click any color to copy</p>
        </div>

        {/* Copy Scale Button */}
        <Button
          variant="outline"
          className="w-full"
          onClick={() => {
            const scaleText = colorScale.join(', ');
            navigator.clipboard.writeText(scaleText);
            toast.success('Color scale copied!');
          }}
        >
          <Copy className="h-4 w-4 mr-2" />
          Copy Entire Scale
        </Button>
      </CardContent>
    </Card>
  );
}
