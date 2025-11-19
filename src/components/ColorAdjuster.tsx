import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { Slider } from './ui/slider';
import { Button } from './ui/button';
import { Copy, ArrowCounterClockwise } from '@phosphor-icons/react';
import { toast } from 'sonner';
import {
  adjustTemperature,
  adjustSaturation,
  adjustBrightness,
  getColorHarmonies,
} from '@/lib/colorManipulation';
import type { ExtractedColor } from '@/lib/types';

interface ColorAdjusterProps {
  colors: ExtractedColor[];
}

export function ColorAdjuster({ colors }: ColorAdjusterProps) {
  const [baseColor, setBaseColor] = useState(colors[0]?.hex || '#6366F1');
  const [temperature, setTemperature] = useState(0);
  const [saturation, setSaturation] = useState(0);
  const [brightness, setBrightness] = useState(0);

  const adjustedColor = (() => {
    let color = baseColor;
    color = adjustTemperature(color, temperature);
    color = adjustSaturation(color, saturation);
    color = adjustBrightness(color, brightness);
    return color;
  })();

  const harmonies = getColorHarmonies(adjustedColor);

  const copyColor = (color: string) => {
    navigator.clipboard.writeText(color);
    toast.success('Color copied!');
  };

  const resetAdjustments = () => {
    setTemperature(0);
    setSaturation(0);
    setBrightness(0);
    toast.success('Adjustments reset');
  };

  const hasAdjustments = temperature !== 0 || saturation !== 0 || brightness !== 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Color Adjuster</CardTitle>
        <CardDescription>
          Fine-tune colors with temperature, saturation, and brightness controls
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
        </div>

        {/* Before/After Comparison */}
        <div className="space-y-2">
          <Label>Before & After</Label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-fg-secondary mb-2">Original</div>
              <div
                className="h-24 rounded-md border flex items-center justify-center font-mono text-sm"
                style={{ backgroundColor: baseColor, color: '#fff', textShadow: '0 0 2px rgba(0,0,0,0.5)' }}
              >
                {baseColor}
              </div>
            </div>
            <div>
              <div className="text-xs text-fg-secondary mb-2">Adjusted</div>
              <button
                onClick={() => copyColor(adjustedColor)}
                className="w-full h-24 rounded-md border flex items-center justify-center font-mono text-sm hover:opacity-90 transition-opacity group relative overflow-hidden"
                style={{ backgroundColor: adjustedColor, color: '#fff', textShadow: '0 0 2px rgba(0,0,0,0.5)' }}
              >
                <span className="relative z-10">{adjustedColor}</span>
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Copy className="h-5 w-5 text-white" />
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Temperature Slider */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Temperature</Label>
            <span className="text-sm text-fg-secondary">
              {temperature > 0 ? `+${temperature}` : temperature}° {temperature > 0 ? '(Warmer)' : temperature < 0 ? '(Cooler)' : ''}
            </span>
          </div>
          <Slider
            value={[temperature]}
            onValueChange={(value) => setTemperature(value[0])}
            min={-100}
            max={100}
            step={5}
          />
          <div className="flex justify-between text-xs text-fg-secondary">
            <span>← Cooler (Blue)</span>
            <span>Warmer (Red) →</span>
          </div>
        </div>

        {/* Saturation Slider */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Saturation</Label>
            <span className="text-sm text-fg-secondary">
              {saturation > 0 ? `+${saturation}` : saturation}%
            </span>
          </div>
          <Slider
            value={[saturation]}
            onValueChange={(value) => setSaturation(value[0])}
            min={-100}
            max={100}
            step={5}
          />
          <div className="flex justify-between text-xs text-fg-secondary">
            <span>← Desaturated</span>
            <span>Vibrant →</span>
          </div>
        </div>

        {/* Brightness Slider */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Brightness</Label>
            <span className="text-sm text-fg-secondary">
              {brightness > 0 ? `+${brightness}` : brightness}%
            </span>
          </div>
          <Slider
            value={[brightness]}
            onValueChange={(value) => setBrightness(value[0])}
            min={-100}
            max={100}
            step={5}
          />
          <div className="flex justify-between text-xs text-fg-secondary">
            <span>← Darker</span>
            <span>Lighter →</span>
          </div>
        </div>

        {/* Reset Button */}
        {hasAdjustments && (
          <Button variant="outline" className="w-full" onClick={resetAdjustments}>
            <ArrowCounterClockwise className="h-4 w-4 mr-2" />
            Reset All Adjustments
          </Button>
        )}

        {/* Color Harmonies */}
        <div className="space-y-4">
          <Label>Color Harmonies</Label>
          
          <div className="space-y-3">
            <div className="space-y-2">
              <div className="text-xs font-medium text-fg-secondary">Complementary</div>
              <div className="flex gap-2">
                {[adjustedColor, harmonies.complementary].map((color, idx) => (
                  <button
                    key={idx}
                    onClick={() => copyColor(color)}
                    className="flex-1 h-12 rounded-md border hover:opacity-80 transition-opacity"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-medium text-fg-secondary">Triadic</div>
              <div className="flex gap-2">
                {harmonies.triadic.map((color, idx) => (
                  <button
                    key={idx}
                    onClick={() => copyColor(color)}
                    className="flex-1 h-12 rounded-md border hover:opacity-80 transition-opacity"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-medium text-fg-secondary">Analogous</div>
              <div className="flex gap-2">
                {harmonies.analogous.map((color, idx) => (
                  <button
                    key={idx}
                    onClick={() => copyColor(color)}
                    className="flex-1 h-12 rounded-md border hover:opacity-80 transition-opacity"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-medium text-fg-secondary">Split Complementary</div>
              <div className="flex gap-2">
                {harmonies.splitComplementary.map((color, idx) => (
                  <button
                    key={idx}
                    onClick={() => copyColor(color)}
                    className="flex-1 h-12 rounded-md border hover:opacity-80 transition-opacity"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-medium text-fg-secondary">Monochromatic</div>
              <div className="flex gap-1 rounded-md overflow-hidden border h-12">
                {harmonies.monochromatic.map((color, idx) => (
                  <button
                    key={idx}
                    onClick={() => copyColor(color)}
                    className="flex-1 hover:opacity-80 transition-opacity"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
