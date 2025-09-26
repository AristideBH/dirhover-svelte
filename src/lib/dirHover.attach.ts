import gsap from 'gsap';
import type { DirectionalHoverAnimation, DirectionalHoverOptions, DirectionalHoverOverlay, DirectionalHoverTouchPosition } from './dirHover.types.ts';
import { createDirHoverElements, getPositionFromSide } from './dirHover.utils.ts';
import { createMouseHandler, createTouchHandler } from './dirHover.handlers.ts';


export const defaultOptions: {
    animation: DirectionalHoverAnimation;
    overlay: DirectionalHoverOverlay;
    touchPosition: DirectionalHoverTouchPosition;
} = {
    animation: { duration: 0.125, ease: 'power2.out' },
    overlay: {
        background: 'rgba(30, 30, 40, 0.12)',
        opacity: 1,
        mixBlendMode: 'normal'
    },
    touchPosition: {
        start: 'bottom',
        end: 'top'
    }
};

// Track GSAP tweens per curtain element for safety
export const tweenMap = new WeakMap<HTMLElement, gsap.core.Tween>();

/**
 * Svelte attachement: dirhover
 * =======================
 *
 * Adds a professional, animated directional hover/touch overlay to any element.
 *
 * ## Features
 * - Directional animation based on mouse entry/exit or touch
 * - Customizable overlay color, opacity, blend mode, and animation
 * - Theming support via CSS variable (`--dirhover-overlay-bg`)
 * - Accessibility: overlay is `aria-hidden`, parent/child/curtain can receive ARIA and tabindex attributes
 * - SSR-safe: no DOM/GSAP code runs on server
 * - Full cleanup: restores original content and removes listeners/children
 * - Extensible: pass custom classes, attributes, and animation callbacks
 *
 * ## Usage
 *
 * ````svelte
 * <button {@attach dirhover()}/>
 * <button {@attach dirhover({
 *      animation: { duration: 0.3, ease: 'power2.out' },
 *      overlay: { background: 'rgba(0,0,0,0.2)', opacity: 0.7, mixBlendMode: 'multiply' },
 *      touchPosition: { start: 'left', end: 'bottom' },
 *      parentClass: 'custom-parent',
 *      childClass: 'custom-child',
 *      curtainClass: 'custom-curtain',
 *      parentAttrs: { tabindex: '0', 'aria-label': 'Hoverable' },
 *      childAttrs: { 'aria-live': 'polite' },
 *      curtainAttrs: { 'aria-hidden': 'true' },
 *      onEnter: () => console.log('Hover in'),
 *      onLeave: () => console.log('Hover out')
 *    }
 * )}/>
 * ````
 *
 * ## Options
 * - `animation`: { duration, ease } — GSAP animation settings
 * - `overlay`: { background, opacity, mixBlendMode } — overlay appearance
 * - `touchPosition`: { start, end } — direction for touch enter/leave
 * - `parentClass`, `childClass`, `curtainClass`: custom CSS classes
 * - `parentAttrs`, `childAttrs`, `curtainAttrs`: custom attributes (ARIA, tabindex, etc.)
 * - `onEnter`, `onLeave`: callbacks for animation lifecycle
 *
 * ## Accessibility
 * - Overlay is `aria-hidden` by default
 * - Pass ARIA attributes/tabindex to parent/child/curtain for full control
 *
 * ## Theming
 * - Use CSS variable `--dirhover-overlay-bg` to override overlay background
 *   Example: `:root { --dirhover-overlay-bg: rgba(0,0,0,0.15); }`
 *
 * ## SSR
 * - Action is a no-op on server (safe for SvelteKit/SSR)
 *
 * ## Cleanup
 * - Removes all event listeners and children
 * - Restores original node content
 *
 * ## Advanced
 * - Works with any element (button, div, etc.)
 * - Fully type-safe with TypeScript
 * - Easily extendable for custom animation logic
 *
 * @param userOptions Customization options for animation, overlay, touch positions, classes, attributes, and callbacks.
 * @returns Svelte action function
 */
export default function dirhover(userOptions: DirectionalHoverOptions = {}) {
    const options = {
        animation: { ...defaultOptions.animation, ...userOptions.animation },
        overlay: { ...defaultOptions.overlay, ...userOptions.overlay },
        touchPosition: {
            start: userOptions.touchPosition?.start ?? defaultOptions.touchPosition.start,
            end: userOptions.touchPosition?.end ?? defaultOptions.touchPosition.end
        }
    };

    return (node: HTMLElement) => {
        // SSR safety
        if (typeof window === 'undefined') return;
        // Setup parent styles, attributes, and class
        node.setAttribute('data-dirhover', 'parent');
        Object.assign(node.style, {
            position: 'relative',
            overflow: 'hidden'
        });
        if (userOptions.parentClass) node.classList.add(userOptions.parentClass);
        if (userOptions.parentAttrs) Object.entries(userOptions.parentAttrs).forEach(([k, v]) => node.setAttribute(k, v));

        // Setup child and overlay elements
        const originalContent = node.innerHTML;
        const child = createDirHoverElements(
            'span',
            { 'data-dirhover': 'child', ...(userOptions.childAttrs || {}) },
            originalContent,
            { position: 'relative', zIndex: '1' },
            userOptions.childClass
        );

        // Theming: allow CSS variable for overlay background
        const overlayStyles = {
            position: 'absolute',
            width: '100%',
            height: '100%',
            inset: '0',
            background: `var(--dirhover-overlay-bg, ${options.overlay.background})`,
            opacity: options.overlay.opacity.toString(),
            mixBlendMode: options.overlay.mixBlendMode
        };
        const curtain = createDirHoverElements(
            'span',
            { 'data-dirhover': 'overlay', 'aria-hidden': 'true', ...(userOptions.curtainAttrs || {}) },
            undefined,
            overlayStyles,
            userOptions.curtainClass
        );

        // Set initial position of the overlay
        if (curtain) {
            const initialTouchPosition = getPositionFromSide(options.touchPosition.start);
            gsap.set(curtain, initialTouchPosition);
        }

        node.textContent = '';
        if (curtain) node.append(curtain);
        if (child) node.append(child);

        // Event handlers (mouse and touch)
        const handlers = {
            mouseenter: (e: Event) => {
                if (curtain) createMouseHandler('in', curtain, options)(e);
                userOptions.onEnter?.();
            },
            mouseleave: (e: Event) => {
                if (curtain) createMouseHandler('out', curtain, options)(e);
                userOptions.onLeave?.();
            },
            touchstart: () => {
                if (curtain) createTouchHandler('in', curtain, options)();
                userOptions.onEnter?.();
            },
            touchend: () => {
                if (curtain) createTouchHandler('out', curtain, options)();
                userOptions.onLeave?.();
            }
        } as const;

        Object.entries(handlers).forEach(([event, handler]) => {
            node.addEventListener(event, handler);
        });

        // Cleanup
        return () => {
            Object.entries(handlers).forEach(([event, handler]) => {
                node.removeEventListener(event, handler);
            });
            if (curtain) tweenMap.delete(curtain);
            // Remove added children
            if (child && node.contains(child)) node.removeChild(child);
            if (curtain && node.contains(curtain)) node.removeChild(curtain);
            // Restore original content
            node.innerHTML = originalContent;
        };
    };
}