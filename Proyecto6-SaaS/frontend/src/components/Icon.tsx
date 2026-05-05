interface IconProps {
  name: string
  size?: number
  strokeWidth?: number
  style?: React.CSSProperties
  className?: string
}

export default function Icon({ name, size = 16, strokeWidth = 1.6, style, className = '' }: IconProps) {
  const props = {
    width: size, height: size, viewBox: '0 0 24 24',
    fill: 'none', stroke: 'currentColor', strokeWidth,
    strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const,
    style, className,
  }
  switch (name) {
    case 'arrow-right':   return <svg {...props}><path d="M5 12h14M13 6l6 6-6 6"/></svg>
    case 'arrow-up-right':return <svg {...props}><path d="M7 17 17 7M9 7h8v8"/></svg>
    case 'check':         return <svg {...props}><path d="M4 12l5 5L20 6"/></svg>
    case 'plus':          return <svg {...props}><path d="M12 5v14M5 12h14"/></svg>
    case 'sun':           return <svg {...props}><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>
    case 'moon':          return <svg {...props}><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
    case 'sparkles':      return <svg {...props}><path d="M12 3l2 5 5 2-5 2-2 5-2-5-5-2 5-2 2-5zM19 14l1 2 2 1-2 1-1 2-1-2-2-1 2-1 1-2zM5 16l.7 1.5L7 18l-1.3.5L5 20l-.7-1.5L3 18l1.3-.5L5 16z"/></svg>
    case 'mic':           return <svg {...props}><rect x="9" y="3" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg>
    case 'send':          return <svg {...props}><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>
    case 'chevron-right': return <svg {...props}><path d="M9 6l6 6-6 6"/></svg>
    case 'chevron-down':  return <svg {...props}><path d="M6 9l6 6 6-6"/></svg>
    case 'chevron-up':    return <svg {...props}><path d="M6 15l6-6 6 6"/></svg>
    case 'chevron-left':  return <svg {...props}><path d="M15 6l-6 6 6 6"/></svg>
    case 'logout':        return <svg {...props}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/></svg>
    case 'upload':        return <svg {...props}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>
    case 'file':          return <svg {...props}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h8M8 9h2"/></svg>
    case 'x':             return <svg {...props}><path d="M18 6L6 18M6 6l12 12"/></svg>
    case 'trending':      return <svg {...props}><path d="M3 17l6-6 4 4 8-8M14 7h7v7"/></svg>
    case 'target':        return <svg {...props}><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/></svg>
    case 'zap':           return <svg {...props}><path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z"/></svg>
    case 'book':          return <svg {...props}><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
    case 'refresh':       return <svg {...props}><path d="M3 12a9 9 0 0 1 15-6.7L21 8M21 3v5h-5M21 12a9 9 0 0 1-15 6.7L3 16M3 21v-5h5"/></svg>
    case 'pause':         return <svg {...props}><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
    case 'play':          return <svg {...props}><polygon points="5 3 19 12 5 21 5 3" fill="currentColor"/></svg>
    case 'lightbulb':     return <svg {...props}><path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.3 1 2v.3h6V17a3 3 0 0 1 1-2.3A7 7 0 0 0 12 2z"/></svg>
    case 'bar-chart':     return <svg {...props}><rect x="18" y="3" width="4" height="18"/><rect x="10" y="8" width="4" height="13"/><rect x="2" y="13" width="4" height="8"/></svg>
    case 'trophy':        return <svg {...props}><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22M18 2H6v7a6 6 0 0 0 12 0V2z"/></svg>
    case 'arrow-up':      return <svg {...props}><path d="M12 19V5M5 12l7-7 7 7"/></svg>
    case 'arrow-down':     return <svg {...props}><path d="M12 5v14M19 12l-7 7-7-7"/></svg>
    case 'minus':          return <svg {...props}><path d="M5 12h14"/></svg>
    case 'bookmark':       return <svg {...props}><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
    case 'external-link':  return <svg {...props}><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"/></svg>
    case 'user':           return <svg {...props}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
    default:               return null
  }
}
