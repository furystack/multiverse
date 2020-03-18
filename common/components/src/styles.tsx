import { PartialElement } from '@furystack/shades'

declare global {
  interface CSSStyleDeclaration {
    backdropFilter: string
  }
}

const glassBox: PartialElement<CSSStyleDeclaration> = {
  backdropFilter: 'blur(4px)',
  borderRadius: '5px',
  boxShadow: 'rgba(0, 0, 0, 0.5) 0px 0px 50px 15px, inset 0px 0px 45px -5px rgba(192,192,192,0.2)',
}

export const styles = {
  glassBox,
}
