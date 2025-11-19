import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Check, X, Copy, Download } from '@phosphor-icons/react';
import { toast } from 'sonner';
import {
  checkAccessibility,
  suggestAccessibleColors,
  formatContrastRatio,
  getWCAGLevelColor,
  getWCAGLevelDescription,
  type AccessibleColorPair,
  type WCAGLevel,
} from '@/lib/accessibilityUtils';
import type { ExtractedColor } from '@/lib/types';

interface AccessibilityCheckerProps {
  colors: ExtractedColor[];
}

export function AccessibilityChecker({ colors }: AccessibilityCheckerProps) {
  const [selectedForeground, setSelectedForeground] = useState<string>(colors[0]?.hex || '#000000');
  const [selectedBackground, setSelectedBackground] = useState<string>(colors[colors.length - 1]?.hex || '#FFFFFF');
  
  const result = checkAccessibility(selectedForeground, selectedBackground);
  const suggestions = suggestAccessibleColors(selectedForeground, selectedBackground, 4.5);
  
  // Generate all color pairs for matrix view
  const colorPairs: AccessibleColorPair[] = [];
  for (const fg of colors) {
    for (const bg of colors) {
      if (fg.hex !== bg.hex) {
        colorPairs.push(checkAccessibility(fg.hex, bg.hex));
      }
    }
  }
  
  const passingPairs = colorPairs.filter(p => p.passes);
  const failingPairs = colorPairs.filter(p => !p.passes);
  
  const copyColor = (color: string) => {
    navigator.clipboard.writeText(color);
    toast.success('Color copied to clipboard');
  };
  
  const exportReport = () => {
    const report = `# Accessibility Report
    
## Summary
- Total color pairs tested: ${colorPairs.length}
- Passing pairs (AA or better): ${passingPairs.length}
- Failing pairs: ${failingPairs.length}

## Selected Pair Analysis
Foreground: ${selectedForeground}
Background: ${selectedBackground}
Contrast Ratio: ${formatContrastRatio(result.contrastRatio)}
- Normal Text: ${result.compliance.normalText}
- Large Text: ${result.compliance.largeText}
- UI Components: ${result.compliance.uiComponents}

## All Passing Pairs (AA or better)
${passingPairs.map(p => `- ${p.foreground} on ${p.background}: ${formatContrastRatio(p.contrastRatio)} (${p.compliance.normalText})`).join('\n')}

## Failing Pairs
${failingPairs.map(p => `- ${p.foreground} on ${p.background}: ${formatContrastRatio(p.contrastRatio)}`).join('\n')}
`;
    
    const blob = new Blob([report], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'accessibility-report.md';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Report exported');
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Color Accessibility Checker</CardTitle>
          <CardDescription>
            Check WCAG 2.1 contrast compliance for your color palette
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="checker" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="checker">Checker</TabsTrigger>
              <TabsTrigger value="matrix">Matrix</TabsTrigger>
              <TabsTrigger value="report">Report</TabsTrigger>
            </TabsList>
            
            <TabsContent value="checker" className="space-y-6">
              {/* Color Selectors */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Foreground Color</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {colors.map((color) => (
                      <button
                        key={color.hex}
                        onClick={() => setSelectedForeground(color.hex)}
                        className={`h-12 rounded-md border-2 transition-all ${
                          selectedForeground === color.hex
                            ? 'border-accent-9 ring-2 ring-accent-9 ring-offset-2'
                            : 'border-neutral-6 hover:border-neutral-8'
                        }`}
                        style={{ backgroundColor: color.hex }}
                        title={color.hex}
                      />
                    ))}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Background Color</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {colors.map((color) => (
                      <button
                        key={color.hex}
                        onClick={() => setSelectedBackground(color.hex)}
                        className={`h-12 rounded-md border-2 transition-all ${
                          selectedBackground === color.hex
                            ? 'border-accent-9 ring-2 ring-accent-9 ring-offset-2'
                            : 'border-neutral-6 hover:border-neutral-8'
                        }`}
                        style={{ backgroundColor: color.hex }}
                        title={color.hex}
                      />
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Preview */}
              <div className="space-y-4">
                <Label>Preview</Label>
                <div
                  className="rounded-lg p-8 text-center"
                  style={{ backgroundColor: selectedBackground, color: selectedForeground }}
                >
                  <h2 className="text-4xl font-bold mb-2">The quick brown fox</h2>
                  <p className="text-lg">jumps over the lazy dog</p>
                  <p className="text-sm mt-4">Small text example (12px)</p>
                </div>
              </div>
              
              {/* Results */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Contrast Ratio</Label>
                  <div className="text-2xl font-bold">
                    {formatContrastRatio(result.contrastRatio)}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <ComplianceRow
                    label="Normal Text (< 18pt)"
                    level={result.compliance.normalText}
                  />
                  <ComplianceRow
                    label="Large Text (≥ 18pt)"
                    level={result.compliance.largeText}
                  />
                  <ComplianceRow
                    label="UI Components"
                    level={result.compliance.uiComponents}
                  />
                </div>
              </div>
              
              {/* Suggestions */}
              {!result.passes && suggestions.length > 0 && (
                <div className="space-y-2">
                  <Label>Suggested Improvements</Label>
                  <div className="space-y-2">
                    {suggestions.map((suggestion, idx) => (
                      <Card key={idx}>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-4">
                            <div
                              className="flex-1 rounded-md p-4 text-center"
                              style={{
                                backgroundColor: suggestion.background,
                                color: suggestion.foreground,
                              }}
                            >
                              Sample Text
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => copyColor(suggestion.foreground)}
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedForeground(suggestion.foreground);
                                  setSelectedBackground(suggestion.background);
                                }}
                              >
                                Apply
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="matrix" className="space-y-4">
              <div className="space-y-2">
                <Label>Color Pair Matrix</Label>
                <p className="text-sm text-fg-secondary">
                  All possible foreground/background combinations
                </p>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="border border-neutral-6 p-2 text-sm">FG \ BG</th>
                      {colors.map((bg) => (
                        <th
                          key={bg.hex}
                          className="border border-neutral-6 p-2"
                          style={{ backgroundColor: bg.hex }}
                        >
                          <div className="w-8 h-8" />
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {colors.map((fg) => (
                      <tr key={fg.hex}>
                        <td
                          className="border border-neutral-6 p-2"
                          style={{ backgroundColor: fg.hex }}
                        >
                          <div className="w-8 h-8" />
                        </td>
                        {colors.map((bg) => {
                          if (fg.hex === bg.hex) {
                            return (
                              <td key={bg.hex} className="border border-neutral-6 p-2 bg-neutral-3" />
                            );
                          }
                          const pair = checkAccessibility(fg.hex, bg.hex);
                          const levelColor = getWCAGLevelColor(pair.compliance.normalText);
                          return (
                            <td
                              key={bg.hex}
                              className="border border-neutral-6 p-2 text-center cursor-pointer hover:ring-2 hover:ring-accent-9"
                              style={{ backgroundColor: levelColor }}
                              onClick={() => {
                                setSelectedForeground(fg.hex);
                                setSelectedBackground(bg.hex);
                              }}
                              title={`${formatContrastRatio(pair.contrastRatio)} - ${pair.compliance.normalText}`}
                            >
                              <span className="text-xs font-bold text-white">
                                {pair.contrastRatio.toFixed(1)}
                              </span>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="flex gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: getWCAGLevelColor('AAA') }} />
                  <span>AAA</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: getWCAGLevelColor('AA') }} />
                  <span>AA</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: getWCAGLevelColor('AA Large') }} />
                  <span>AA Large</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: getWCAGLevelColor('Fail') }} />
                  <span>Fail</span>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="report" className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="text-3xl font-bold">{colorPairs.length}</div>
                    <div className="text-sm text-fg-secondary">Total Pairs</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-3xl font-bold text-green-600">{passingPairs.length}</div>
                    <div className="text-sm text-fg-secondary">Passing (AA+)</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-3xl font-bold text-red-600">{failingPairs.length}</div>
                    <div className="text-sm text-fg-secondary">Failing</div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="space-y-2">
                <Label>Passing Combinations ({passingPairs.length})</Label>
                <div className="space-y-1 max-h-64 overflow-y-auto">
                  {passingPairs.map((pair, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 p-2 rounded-md hover:bg-neutral-2"
                    >
                      <div
                        className="w-8 h-8 rounded"
                        style={{ backgroundColor: pair.foreground }}
                      />
                      <span className="text-sm">on</span>
                      <div
                        className="w-8 h-8 rounded"
                        style={{ backgroundColor: pair.background }}
                      />
                      <span className="flex-1 text-sm">
                        {formatContrastRatio(pair.contrastRatio)}
                      </span>
                      <Badge>{pair.compliance.normalText}</Badge>
                    </div>
                  ))}
                </div>
              </div>
              
              <Button onClick={exportReport} className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

interface ComplianceRowProps {
  label: string;
  level: WCAGLevel;
}

function ComplianceRow({ label, level }: ComplianceRowProps) {
  const passes = level !== 'Fail';
  const color = getWCAGLevelColor(level);
  const description = getWCAGLevelDescription(level);
  
  return (
    <div className="flex items-center justify-between p-3 rounded-lg border border-neutral-6">
      <div className="flex-1">
        <div className="font-medium">{label}</div>
        <div className="text-xs text-fg-secondary">{description}</div>
      </div>
      <div className="flex items-center gap-2">
        <Badge style={{ backgroundColor: color, color: 'white' }}>
          {level}
        </Badge>
        {passes ? (
          <Check className="h-5 w-5 text-green-600" weight="bold" />
        ) : (
          <X className="h-5 w-5 text-red-600" weight="bold" />
        )}
      </div>
    </div>
  );
}
