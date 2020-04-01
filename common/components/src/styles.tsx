import { PartialElement } from '@furystack/shades'

declare global {
  interface CSSStyleDeclaration {
    backdropFilter: string
  }
}

const glassBox: PartialElement<CSSStyleDeclaration> = {
  backdropFilter: 'blur(4px)',
  borderRadius: '5px',
  border: '1px solid rgba(128,128,128,.3)',
  boxShadow: 'rgba(0, 0, 0, 0.3) 2px 2px 2px, 1px 1px 3px -2px rgba(255,255,255,0.3) inset',
}

export const styles = {
  glassBox,
}
