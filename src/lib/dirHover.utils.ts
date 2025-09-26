import type { DirectionalHoverPosition } from "./dirHover.types.js";

export function detectSide(event: MouseEvent, rect: DOMRect): string {
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Calculate distances to each edge and find closest
    const distances = {
        left: x,
        right: rect.width - x,
        top: y,
        bottom: rect.height - y
    };

    return Object.entries(distances).reduce(
        (closest, [side, distance]) =>
            distance < distances[closest as keyof typeof distances] ? side : closest,
        'left'
    );
}

/**
 * Returns GSAP xPercent/yPercent values for a given side.
 * @param side DirectionalHoverPosition
 */
export function getPositionFromSide(side: DirectionalHoverPosition): { xPercent: number; yPercent: number } {
    switch (side) {
        case 'left': return { xPercent: -101, yPercent: 0 };
        case 'right': return { xPercent: 101, yPercent: 0 };
        case 'top': return { xPercent: 0, yPercent: -101 };
        case 'bottom': return { xPercent: 0, yPercent: 101 };
        case 'center': return { xPercent: 0, yPercent: 0 };
        default: return { xPercent: 0, yPercent: 101 };
    }
}

/**
 * Creates an element with attributes, optional innerHTML, styles, and class.
 */
/**
 * Creates an element with attributes, optional innerHTML, styles, and class.
 * Adds accessibility attributes and supports CSS variables for theming.
 * SSR safe: returns null if not in browser.
 *
 * @param tag HTML tag name
 * @param attrs Element attributes
 * @param html Inner HTML
 * @param styles CSS styles (Partial<CSSStyleDeclaration> or CSS variables)
 * @param className CSS class name
 */
export function createDirHoverElements(
    tag: string,
    attrs: Record<string, string>,
    html?: string,
    styles: Partial<CSSStyleDeclaration & Record<string, string>> = {},
    className?: string
): HTMLElement | null {
    if (typeof window === 'undefined') return null;
    const el = document.createElement(tag);
    Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
    // Accessibility: allow aria-* and tabindex
    if (!attrs['aria-hidden'] && tag === 'span') el.setAttribute('aria-hidden', 'true');
    if (attrs['tabindex']) el.setAttribute('tabindex', attrs['tabindex']);
    if (html) el.innerHTML = html;
    Object.entries(styles).forEach(([k, v]) => {
        // Support CSS variables for theming
        if (k.startsWith('--')) {
            el.style.setProperty(k, v as string);
        } else {
            // @ts-expect-error: Assigning possibly numeric value to style property
            el.style[k] = v;
        }
    });
    if (className) el.className = className;
    return el;
}