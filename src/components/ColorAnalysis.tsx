import React, { useMemo } from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Progress } from './ui/progress';
import { Separator } from './ui/separator';
import {
  calculateHarmonyScore,
  getPaletteEmotions,
  suggestIndustries,
  analyzeColorDistribution,
  getColorName,
  getSimilarPalettes,
  type IndustrySuggestion,
} from '../lib/colorAnalysis';
import type { ExtractedColor } from '../lib/types';
import { Heart, TrendUp, Palette, Sparkle, Copy, Check } from '@phosphor-icons/react';

interface ColorAnalysisProps {
  colors: ExtractedColor[];
}

export function ColorAnalysis({ colors }: ColorAnalysisProps) {
  const [copiedPalette, setCopiedPalette] = React.useState<string | null>(null);

  const harmonyScore = useMemo(() => calculateHarmonyScore(colors), [colors]);
  const emotions = useMemo(() => getPaletteEmotions(colors), [colors]);
  const industries = useMemo(() => suggestIndustries(colors), [colors]);
  const distribution = useMemo(() => analyzeColorDistribution(colors), [colors]);
  const similarPalettes = useMemo(() => getSimilarPalettes(colors, 6), [colors]);

  const copyPalette = (palette: string[]) => {
    const paletteString = palette.join(', ');
    navigator.clipboard.writeText(paletteString);
    setCopiedPalette(paletteString);
    setTimeout(() => setCopiedPalette(null), 2000);
  };

  if (colors.length === 0) {
    return (
      <Card className="p-8 text-center">
        <Sparkle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-semibold mb-2">No Colors to Analyze</h3>
        <p className="text-sm text-muted-foreground">
          Upload an image to start analyzing your color palette
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="harmony" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="harmony">
            <Heart className="w-4 h-4 mr-2" />
            Harmony
          </TabsTrigger>
          <TabsTrigger value="emotions">
            <Sparkle className="w-4 h-4 mr-2" />
            Emotions
          </TabsTrigger>
          <TabsTrigger value="industries">
            <TrendUp className="w-4 h-4 mr-2" />
            Industries
          </TabsTrigger>
          <TabsTrigger value="similar">
            <Palette className="w-4 h-4 mr-2" />
            Similar
          </TabsTrigger>
        </TabsList>

        {/* Harmony Tab */}
        <TabsContent value="harmony" className="space-y-4">
          <Card className="p-6">
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold">Harmony Score</h3>
                  <span className="text-3xl font-bold">{harmonyScore}/100</span>
                </div>
                <Progress value={harmonyScore} className="h-2" />
                <p className="text-sm text-muted-foreground mt-2">
                  {harmonyScore >= 75
                    ? 'Excellent! Your palette has strong harmony with complementary and balanced relationships.'
                    : harmonyScore >= 50
                    ? 'Good harmony. The colors work well together with some variation.'
                    : harmonyScore >= 25
                    ? 'Moderate harmony. Consider adjusting some colors for better balance.'
                    : 'Low harmony. The colors may clash or lack cohesion.'}
                </p>
              </div>

              <Separator />

              <div>
                <h4 className="font-semibold mb-3">Color Distribution</h4>
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm">Warm Colors</span>
                      <Badge variant={distribution.dominant === 'warm' ? 'default' : 'secondary'}>
                        {distribution.warmPercentage}%
                      </Badge>
                    </div>
                    <Progress value={distribution.warmPercentage} className="h-2" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm">Cool Colors</span>
                      <Badge variant={distribution.dominant === 'cool' ? 'default' : 'secondary'}>
                        {distribution.coolPercentage}%
                      </Badge>
                    </div>
                    <Progress value={distribution.coolPercentage} className="h-2" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm">Neutral Colors</span>
                      <Badge variant={distribution.dominant === 'neutral' ? 'default' : 'secondary'}>
                        {distribution.neutralPercentage}%
                      </Badge>
                    </div>
                    <Progress value={distribution.neutralPercentage} className="h-2" />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Average Saturation</h4>
                  <div className="flex items-center gap-2">
                    <Progress value={distribution.averageSaturation} className="h-2 flex-1" />
                    <span className="text-sm font-medium">{distribution.averageSaturation}%</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {distribution.averageSaturation > 70
                      ? 'Highly vibrant'
                      : distribution.averageSaturation > 40
                      ? 'Moderately saturated'
                      : 'Muted tones'}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Average Lightness</h4>
                  <div className="flex items-center gap-2">
                    <Progress value={distribution.averageLightness} className="h-2 flex-1" />
                    <span className="text-sm font-medium">{distribution.averageLightness}%</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {distribution.averageLightness > 70
                      ? 'Light palette'
                      : distribution.averageLightness > 30
                      ? 'Balanced brightness'
                      : 'Dark palette'}
                  </p>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-semibold mb-3">Color Names</h4>
                <div className="grid grid-cols-2 gap-2">
                  {colors.map((color, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div
                        className="w-6 h-6 rounded border"
                        style={{ backgroundColor: color.hex }}
                      />
                      <span className="text-sm">{getColorName(color.hex)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Emotions Tab */}
        <TabsContent value="emotions" className="space-y-4">
          <Card className="p-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">Overall Palette Mood</h3>
                <div className="flex flex-wrap gap-2">
                  {emotions.overall.map((emotion, index) => (
                    <Badge key={index} variant="default" className="text-sm py-1">
                      {emotion}
                    </Badge>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mt-3">
                  These are the dominant emotional associations of your palette
                </p>
              </div>

              <Separator />

              <div>
                <h4 className="font-semibold mb-4">Individual Color Emotions</h4>
                <div className="space-y-4">
                  {colors.map((color, index) => {
                    const colorEmotions = emotions.detailed.get(color.hex);
                    if (!colorEmotions) return null;

                    return (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded-lg border shadow-sm"
                            style={{ backgroundColor: color.hex }}
                          />
                          <div className="flex-1">
                            <div className="font-medium text-sm">{getColorName(color.hex)}</div>
                            <div className="text-xs text-muted-foreground">{color.hex}</div>
                          </div>
                        </div>
                        <div className="ml-11 space-y-1">
                          <div className="flex flex-wrap gap-1">
                            {colorEmotions.primary.map((emotion, i) => (
                              <Badge key={i} variant="default" className="text-xs">
                                {emotion}
                              </Badge>
                            ))}
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {colorEmotions.secondary.map((emotion, i) => (
                              <Badge key={i} variant="secondary" className="text-xs">
                                {emotion}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Industries Tab */}
        <TabsContent value="industries" className="space-y-4">
          <Card className="p-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Suggested Industries</h3>
                <p className="text-sm text-muted-foreground">
                  Based on color psychology and industry trends
                </p>
              </div>

              <Separator />

              <div className="space-y-3">
                {industries.map((suggestion: IndustrySuggestion, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold">{suggestion.industry}</h4>
                      <Badge
                        variant={
                          suggestion.confidence === 'high'
                            ? 'default'
                            : suggestion.confidence === 'medium'
                            ? 'secondary'
                            : 'outline'
                        }
                      >
                        {suggestion.confidence} confidence
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{suggestion.reason}</p>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Similar Palettes Tab */}
        <TabsContent value="similar" className="space-y-4">
          <Card className="p-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Similar Palettes</h3>
                <p className="text-sm text-muted-foreground">
                  Curated palettes with similar color schemes
                </p>
              </div>

              <Separator />

              <div className="grid gap-4">
                {similarPalettes.map((palette, index) => (
                  <div
                    key={palette.id}
                    className="p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold">{palette.name}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {palette.category}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {palette.similarity}% match
                          </Badge>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyPalette(palette.colors)}
                      >
                        {copiedPalette === palette.colors.join(', ') ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </div>

                    <div className="flex gap-1 h-12 rounded overflow-hidden">
                      {palette.colors.map((color, colorIndex) => (
                        <div
                          key={colorIndex}
                          className="flex-1 relative group"
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                      ))}
                    </div>

                    <div className="flex flex-wrap gap-1 mt-2">
                      {palette.tags.map((tag, tagIndex) => (
                        <Badge key={tagIndex} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
