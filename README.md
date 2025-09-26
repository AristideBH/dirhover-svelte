# #Svelte attachement: dirhover

Adds a professional, animated directional hover/touch overlay to any element.

## Features

- Directional animation based on mouse entry/exit or touch
- Customizable overlay color, opacity, blend mode, and animation
- Theming support via CSS variable (`--dirhover-overlay-bg`)
- Accessibility: overlay is `aria-hidden`, parent/child/curtain can receive ARIA and tabindex attributes
- SSR-safe: no DOM/GSAP code runs on server
- Full cleanup: restores original content and removes listeners/children
- Extensible: pass custom classes, attributes, and animation callbacks

## Usage

```svelte
<button {@attach dirhover()} />

<!-- or -->

<button
	{@attach dirhover({
		animation: { duration: 0.3, ease: 'power2.out' },
		overlay: { background: 'rgba(0,0,0,0.2)', opacity: 0.7, mixBlendMode: 'multiply' },
		touchPosition: { start: 'left', end: 'bottom' },
		parentClass: 'custom-parent',
		childClass: 'custom-child',
		curtainClass: 'custom-curtain',
		parentAttrs: { tabindex: '0', 'aria-label': 'Hoverable' },
		childAttrs: { 'aria-live': 'polite' },
		curtainAttrs: { 'aria-hidden': 'true' },
		onEnter: () => console.log('Hover in'),
		onLeave: () => console.log('Hover out')
	})}
/>
```

## Options

- `animation`: { duration, ease } — GSAP animation settings
- `overlay`: { background, opacity, mixBlendMode } — overlay appearance
- `touchPosition`: { start, end } — direction for touch enter/leave
- `parentClass`, `childClass`, `curtainClass`: custom CSS classes
- `parentAttrs`, `childAttrs`, `curtainAttrs`: custom attributes (ARIA, tabindex, etc.)
- `onEnter`, `onLeave`: callbacks for animation lifecycle

## Accessibility

- Overlay is `aria-hidden` by default
- Pass ARIA attributes/tabindex to parent/child/curtain for full control

## Theming

- Use CSS variable `--dirhover-overlay-bg` to override overlay background
  Example: `:root { --dirhover-overlay-bg: rgba(0,0,0,0.15); }`

## SSR

- Action is a no-op on server (safe for SvelteKit/SSR)

## Cleanup

- Removes all event listeners and children
- Restores original node content
