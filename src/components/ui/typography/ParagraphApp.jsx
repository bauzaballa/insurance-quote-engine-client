import React from 'react';

import styles from './typography.module.scss';

// Mapeo directo de las 4 variantes de Figma con nombres descriptivos
const variantMap = {
  '10px-bold': styles['typography-10px-bold'],
  '15px-bold': styles['typography-15px-bold'],
  '18px-bold': styles['typography-18px-uppercase'],
  '18px-medium': styles['typography-18px-medium'],
  '16px-medium-uppercase': styles['typography-16px-medium-uppercase'],
  '12px-bold-centered': styles['typography-12px-bold-centered'],
  '24px-bold-uppercase': styles['typography-24px-bold-uppercase'],
  '14px-bold': styles['typography-14px-bold'],
  '12px-medium': styles['typography-12px-medium'],
};

// Color mapping using variables
const colorMap = {
  primary: styles['typography-color-primary'],
  red: styles['typography-color-red'],
  done: styles['typography-color-done'],
  text: styles['typography-color-text'],
  bg: styles['typography-color-bg'],
  'blue-text': styles['typography-color-blue-primary'],
  'light-blue': styles['typography-color-light-blue'],
  'dark-blue': styles['typography-color-dark-blue'],
  border: styles['typography-color-border'],
};

/**
 * Reusable Paragraph component with Figma typography variants
 * @param {string} variant - Typography variant (18px-bold, 16px-medium-uppercase, 12px-bold-centered, 24px-bold-uppercase)
 * @param {string} color - Color variant using design system variables (primary, red, done, text, bg, blue-text, light-blue, dark-blue, border)
 * @param {string} as - HTML element to render (p, span, div, etc.)
 * @param {ReactNode} children - Content to render
 * @param {object} rest - Additional props passed to the element
 */
const ParagraphApp = React.forwardRef(
  (
    { variant = '18px-bold', color, as: Component = 'p', children, className = '', ...rest },
    ref
  ) => {
    const variantClass = variantMap[variant] || variantMap['18px-bold'];
    const colorClass = color ? colorMap[color] : '';

    return (
      <Component
        ref={ref}
        className={`${className} ${variantClass} ${colorClass}`.trim()}
        {...rest}
      >
        {children}
      </Component>
    );
  }
);

ParagraphApp.displayName = 'ParagraphApp';

export { ParagraphApp };
