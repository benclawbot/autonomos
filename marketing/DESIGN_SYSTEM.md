# Autonomos - Design System

## Quality Principles

1. **Less but better** - Few elements, done excellently
2. **Every pixel matters** - No sloppy spacing
3. **Consistency** - Same patterns everywhere
4. **Performance** - Fast = quality

---

## Colors

### Primary Palette
- **Background:** #0a0a0a (near black)
- **Surface:** #111111 (cards)
- **Border:** #222222 (subtle)
- **Text Primary:** #e0e0e0
- **Text Secondary:** #666666

### Accent
- **Primary:** #00ff88 (neon green)
- **Hover:** #00cc6a
- **Muted:** #00ff8833

### Status
- **Success:** #00ff88
- **Warning:** #ffaa00
- **Error:** #ff4444

---

## Typography

### Font Stack
```
font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
```

### Scale
- **H1:** 2.5rem, weight 300
- **H2:** 1.75rem, weight 400
- **Body:** 1rem, weight 400
- **Small:** 0.875rem
- **Caption:** 0.75rem

---

## Spacing

### Scale (8px base)
- **xs:** 4px
- **sm:** 8px
- **md:** 16px
- **lg:** 24px
- **xl:** 32px
- **2xl:** 48px
- **3xl:** 64px

---

## Components

### Buttons
- **Primary:** bg-accent, text-black, rounded-lg, px-4 py-2
- **Secondary:** border-white/10, text-white, hover:border-white/30
- **Ghost:** text-white/60, hover:text-white

### Cards
- bg-surface, border border-white/5, rounded-xl, p-6
- Hover: border-accent/30, translateX-2

### Inputs
- bg-white/5, border-white/10, rounded-lg
- Focus: border-accent, outline-none

---

## Animations

### Transitions
- Default: 200ms ease
- Hover: 150ms ease
- Page: 300ms ease

### Effects
- Glow: box-shadow: 0 0 20px accent/20
- Hover lift: translateY(-2px)

---

## Rules

1. **Never ship ugly** - If it looks bad, fix it
2. **Whitespace is luxury** - Use it
3. **One accent color** - Green only
4. **Dark by default** - Light only if needed
5. **Mobile first** - Then enhance

---

## Quality Checklist

Before launching:
- [ ] All buttons same height
- [ ] Consistent padding
- [ ] No broken layouts
- [ ] Fast load times
- [ ] Mobile works perfectly
- [ ] No visual glitches
- [ ] Animations smooth (60fps)
