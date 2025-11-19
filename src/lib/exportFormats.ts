import type { ExtractedColor } from './types';
import type { ThemeConfig } from './themeConfig';
import type { CustomGradientConfig } from '@/components/GradientEditorModal';

/**
 * Export colors as Tailwind CSS configuration
 */
export function exportAsTailwindConfig(colors: ExtractedColor[], config: ThemeConfig): string {
    const colorEntries = colors.map((color, index) => {
        const name = `color-${index + 1}`;
        return `        '${name}': '${color.hex}',`;
    }).join('\n');

    return `/** @type {import('tailwindcss').Config} */
export default {
  theme: {
    extend: {
      colors: {
${colorEntries}
        // Semantic colors
        primary: '${config.colors.primary}',
        secondary: '${config.colors.secondary}',
        accent: '${config.colors.accent}',
        background: '${config.colors.background}',
        foreground: '${config.colors.foreground}',
      },
    },
  },
  plugins: [],
}`;
}

/**
 * Export colors as SCSS variables
 */
export function exportAsSCSS(colors: ExtractedColor[], config: ThemeConfig): string {
    const colorVars = colors.map((color, index) => {
        return `$color-${index + 1}: ${color.hex};`;
    }).join('\n');

    return `// Color Palette
${colorVars}

// Semantic Colors
$primary: ${config.colors.primary};
$secondary: ${config.colors.secondary};
$accent: ${config.colors.accent};
$background: ${config.colors.background};
$foreground: ${config.colors.foreground};
$muted: ${config.colors.muted};`;
}

/**
 * Export colors as JavaScript/TypeScript module
 */
export function exportAsJavaScript(colors: ExtractedColor[], config: ThemeConfig, typescript = false): string {
    if (typescript) {
        return `export const theme = {
  colors: {
${colors.map((color, i) => `    color${i + 1}: '${color.hex}',`).join('\n')}
    primary: '${config.colors.primary}',
    secondary: '${config.colors.secondary}',
    accent: '${config.colors.accent}',
    background: '${config.colors.background}',
    foreground: '${config.colors.foreground}',
  },
} as const;

export type Theme = typeof theme;`;
    } else {
        return `module.exports = {
  colors: {
${colors.map((color, i) => `    color${i + 1}: '${color.hex}',`).join('\n')}
    primary: '${config.colors.primary}',
    secondary: '${config.colors.secondary}',
    accent: '${config.colors.accent}',
    background: '${config.colors.background}',
    foreground: '${config.colors.foreground}',
  },
};`;
    }
}

/**
 * Export colors as Figma Design Tokens
 */
export function exportAsFigmaTokens(colors: ExtractedColor[], config: ThemeConfig): string {
    const colorTokens = colors.reduce((acc, color, index) => {
        acc[`color-${index + 1}`] = {
            value: color.hex,
            type: 'color',
        };
        return acc;
    }, {} as Record<string, { value: string; type: string }>);

    const tokens = {
        colors: {
            ...colorTokens,
            primary: { value: config.colors.primary, type: 'color' },
            secondary: { value: config.colors.secondary, type: 'color' },
            accent: { value: config.colors.accent, type: 'color' },
            background: { value: config.colors.background, type: 'color' },
            foreground: { value: config.colors.foreground, type: 'color' },
        },
    };

    return JSON.stringify(tokens, null, 2);
}

/**
 * Export gradient as SVG
 */
export function exportGradientAsSVG(
    gradient: string,
    name: string,
    width = 1200,
    height = 800
): string {
    // Parse the gradient string to extract colors and positions
    const gradientMatch = gradient.match(/linear-gradient\(([^)]+)\)/);
    if (!gradientMatch) {
        return '';
    }

    const gradientValue = gradientMatch[1];
    const parts = gradientValue.split(',').map(p => p.trim());

    // Extract angle or direction
    let angle = '180';
    let colorStops = parts;
    if (parts[0].includes('deg') || parts[0].includes('turn') || ['to top', 'to bottom', 'to left', 'to right'].includes(parts[0])) {
        colorStops = parts.slice(1);
        if (parts[0].includes('deg')) {
            angle = parts[0].replace('deg', '').trim();
        } else if (parts[0] === 'to bottom') {
            angle = '180';
        } else if (parts[0] === 'to right') {
            angle = '90';
        } else if (parts[0] === 'to left') {
            angle = '270';
        } else if (parts[0] === 'to top') {
            angle = '0';
        }
    }

    // Convert angle to SVG coordinates
    const angleRad = (parseFloat(angle) - 90) * Math.PI / 180;
    const x1 = 50 + 50 * Math.cos(angleRad);
    const y1 = 50 + 50 * Math.sin(angleRad);
    const x2 = 50 - 50 * Math.cos(angleRad);
    const y2 = 50 - 50 * Math.sin(angleRad);

    // Parse color stops
    const stops = colorStops.map(stop => {
        const match = stop.match(/(#[0-9a-fA-F]{6}|#[0-9a-fA-F]{3}|rgb\([^)]+\)|hsl\([^)]+\))\s*(\d+%)?/);
        if (match) {
            return {
                color: match[1],
                offset: match[2] || '',
            };
        }
        return null;
    }).filter(Boolean);

    const stopElements = stops.map((stop, index) => {
        const offset = stop!.offset || `${(index / (stops.length - 1)) * 100}%`;
        return `    <stop offset="${offset}" stop-color="${stop!.color}" />`;
    }).join('\n');

    return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="${name}" x1="${x1}%" y1="${y1}%" x2="${x2}%" y2="${y2}%">
${stopElements}
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#${name})" />
</svg>`;
}

/**
 * Generate component code examples
 */
export function generateComponentExample(
    type: 'button' | 'card' | 'nav' | 'form',
    framework: 'react' | 'vue' | 'html',
    config: ThemeConfig
): string {
    if (framework === 'react') {
        switch (type) {
            case 'button':
                return `import { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent';
}

export function Button({ variant = 'primary', children, ...props }: ButtonProps) {
  const styles = {
    primary: {
      backgroundColor: '${config.colors.primary}',
      color: '${config.colors.background}',
    },
    secondary: {
      backgroundColor: '${config.colors.secondary}',
      color: '${config.colors.background}',
    },
    accent: {
      backgroundColor: '${config.colors.accent}',
      color: '${config.colors.background}',
    },
  };

  return (
    <button
      style={{
        ...styles[variant],
        padding: '0.5rem 1rem',
        borderRadius: '0.375rem',
        border: 'none',
        cursor: 'pointer',
        fontWeight: 600,
      }}
      {...props}
    >
      {children}
    </button>
  );
}`;

            case 'card':
                return `import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
}

export function Card({ children }: CardProps) {
  return (
    <div
      style={{
        backgroundColor: '${config.colors.background}',
        color: '${config.colors.foreground}',
        borderRadius: '0.5rem',
        padding: '1.5rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      }}
    >
      {children}
    </div>
  );
}`;

            case 'nav':
                return `import { ReactNode } from 'react';

interface NavProps {
  children: ReactNode;
}

export function Nav({ children }: NavProps) {
  return (
    <nav
      style={{
        backgroundColor: '${config.colors.background}',
        color: '${config.colors.foreground}',
        padding: '1rem 1.5rem',
        borderBottom: '1px solid ${config.colors.secondary}',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
      }}
    >
      {children}
    </nav>
  );
}`;

            case 'form':
                return `import { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function Input({ label, ...props }: InputProps) {
  return (
    <div style={{ marginBottom: '1rem' }}>
      {label && (
        <label
          style={{
            display: 'block',
            marginBottom: '0.5rem',
            color: '${config.colors.foreground}',
            fontWeight: 500,
          }}
        >
          {label}
        </label>
      )}
      <input
        style={{
          width: '100%',
          padding: '0.5rem 1rem',
          borderRadius: '0.375rem',
          border: '1px solid ${config.colors.secondary}',
          backgroundColor: '${config.colors.background}',
          color: '${config.colors.foreground}',
        }}
        {...props}
      />
    </div>
  );
}`;
        }
    } else if (framework === 'html') {
        switch (type) {
            case 'button':
                return `<button style="
  background-color: ${config.colors.primary};
  color: ${config.colors.background};
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  border: none;
  cursor: pointer;
  font-weight: 600;
">
  Click me
</button>`;

            case 'card':
                return `<div style="
  background-color: ${config.colors.background};
  color: ${config.colors.foreground};
  border-radius: 0.5rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
">
  <h2>Card Title</h2>
  <p>Card content goes here</p>
</div>`;

            case 'nav':
                return `<nav style="
  background-color: ${config.colors.background};
  color: ${config.colors.foreground};
  padding: 1rem 1.5rem;
  border-bottom: 1px solid ${config.colors.secondary};
  display: flex;
  align-items: center;
  gap: 1rem;
">
  <a href="/">Home</a>
  <a href="/about">About</a>
  <a href="/contact">Contact</a>
</nav>`;

            case 'form':
                return `<div style="margin-bottom: 1rem;">
  <label style="
    display: block;
    margin-bottom: 0.5rem;
    color: ${config.colors.foreground};
    font-weight: 500;
  ">
    Email
  </label>
  <input
    type="email"
    style="
      width: 100%;
      padding: 0.5rem 1rem;
      border-radius: 0.375rem;
      border: 1px solid ${config.colors.secondary};
      background-color: ${config.colors.background};
      color: ${config.colors.foreground};
    "
  />
</div>`;
        }
    }

    return '// Vue examples coming soon';
}

/**
 * Export all gradients as a zip file (returns array of files for zip)
 */
export function prepareGradientsForZip(
    colors: ExtractedColor[],
    customGradients: CustomGradientConfig[]
): Array<{ name: string; content: string; type: 'svg' | 'css' }> {
    const files: Array<{ name: string; content: string; type: 'svg' | 'css' }> = [];

    // Generate some default gradients from colors
    if (colors.length >= 2) {
        const gradient1 = `linear-gradient(135deg, ${colors[0].hex}, ${colors[1].hex})`;
        files.push({
            name: 'gradient-1.svg',
            content: exportGradientAsSVG(gradient1, 'gradient-1'),
            type: 'svg',
        });
        files.push({
            name: 'gradient-1.css',
            content: `.gradient-1 {\n  background: ${gradient1};\n}`,
            type: 'css',
        });
    }

    if (colors.length >= 3) {
        const gradient2 = `linear-gradient(45deg, ${colors[1].hex}, ${colors[2].hex})`;
        files.push({
            name: 'gradient-2.svg',
            content: exportGradientAsSVG(gradient2, 'gradient-2'),
            type: 'svg',
        });
        files.push({
            name: 'gradient-2.css',
            content: `.gradient-2 {\n  background: ${gradient2};\n}`,
            type: 'css',
        });
    }

    // Add custom gradients
    customGradients.forEach((gradient, index) => {
        files.push({
            name: `${gradient.name || `custom-gradient-${index + 1}`}.svg`,
            content: exportGradientAsSVG(gradient.gradient, gradient.name || `custom-gradient-${index + 1}`),
            type: 'svg',
        });
        files.push({
            name: `${gradient.name || `custom-gradient-${index + 1}`}.css`,
            content: `.${gradient.name || `custom-gradient-${index + 1}`} {\n  background: ${gradient.gradient};\n}`,
            type: 'css',
        });
    });

    return files;
}
