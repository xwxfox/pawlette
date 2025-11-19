import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Copy, Check } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { generateComponentExample } from '@/lib/exportFormats';
import type { ThemeConfig } from '@/lib/themeConfig';

interface ComponentExamplesProps {
  config: ThemeConfig;
}

export function ComponentExamples({ config }: ComponentExamplesProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [framework, setFramework] = useState<'react' | 'vue' | 'html'>('react');

  const handleCopy = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    toast.success('Code copied to clipboard');
  };

  const components: Array<{
    id: string;
    type: 'button' | 'card' | 'nav' | 'form';
    title: string;
    description: string;
  }> = [
    { id: 'button', type: 'button', title: 'Button', description: 'Primary button component with variants' },
    { id: 'card', type: 'card', title: 'Card', description: 'Card container with padding and shadow' },
    { id: 'nav', type: 'nav', title: 'Navigation', description: 'Navigation bar with links' },
    { id: 'form', type: 'form', title: 'Input', description: 'Form input with label' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Component Examples</CardTitle>
        <CardDescription>
          Copy ready-to-use component code with your theme colors
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Framework</Label>
          <Tabs value={framework} onValueChange={(v) => setFramework(v as any)} className="mt-2">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="react">React</TabsTrigger>
              <TabsTrigger value="html">HTML</TabsTrigger>
              <TabsTrigger value="vue">Vue (Soon)</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="space-y-4">
          {components.map((component) => {
            const code = generateComponentExample(component.type, framework, config);
            const copyId = `${component.id}-${framework}`;

            return (
              <Card key={component.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base">{component.title}</CardTitle>
                      <CardDescription className="text-xs">
                        {component.description}
                      </CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopy(code, copyId)}
                    >
                      {copiedId === copyId ? (
                        <>
                          <Check className="h-4 w-4 mr-2" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4 mr-2" />
                          Copy
                        </>
                      )}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <pre className="p-4 rounded-md bg-neutral-2 overflow-x-auto text-xs">
                    <code>{code}</code>
                  </pre>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
