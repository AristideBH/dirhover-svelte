import type { defaultOptions } from './dirHover.attach.js';

export type DirectionalHoverPosition = 'top' | 'bottom' | 'left' | 'right' | 'center';

export interface DirectionalHoverAnimation {
    duration: number;
    ease: string;
}

export interface DirectionalHoverOverlay {
    background: string;
    opacity: number;
    mixBlendMode: string;
}

export interface DirectionalHoverTouchPosition {
    start: DirectionalHoverPosition;
    end: DirectionalHoverPosition;
}

export interface DirectionalHoverOptions {
    animation?: Partial<DirectionalHoverAnimation>;
    overlay?: Partial<DirectionalHoverOverlay>;
    touchPosition?: Partial<DirectionalHoverTouchPosition>;
    parentAttrs?: Record<string, string>;
    childAttrs?: Record<string, string>;
    curtainAttrs?: Record<string, string>;
    parentClass?: string;
    childClass?: string;
    curtainClass?: string;
    onEnter?: () => void;
    onLeave?: () => void;
}

export type ActionAnimation = 'in' | 'out';

export type DirHoverHandlerParams = {
    action: ActionAnimation;
    curtain: HTMLElement;
    options: typeof defaultOptions;
    getDirection: (action: ActionAnimation, event?: Event) => import('./dirHover.types.js').DirectionalHoverPosition;
    event?: Event;
};