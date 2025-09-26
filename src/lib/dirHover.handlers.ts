import gsap from 'gsap';
import { defaultOptions, tweenMap } from './dirHover.attach';
import { getPositionFromSide, detectSide } from './dirHover.utils';
import type { ActionAnimation, DirHoverHandlerParams } from './dirHover.types';

function dirHoverHandler({ action, curtain, options, getDirection, event }: DirHoverHandlerParams) {
    if (!curtain) return;
    let currentTween = tweenMap.get(curtain) || null;
    const direction = getDirection(action, event);
    const position = getPositionFromSide(direction);

    if (action === 'in') {
        if (currentTween) currentTween.kill();
        currentTween = gsap.fromTo(curtain, position, {
            xPercent: 0,
            yPercent: 0,
            ...options.animation,
            onComplete: () => {
                tweenMap.delete(curtain);
            }
        });
        tweenMap.set(curtain, currentTween);
    } else {
        if (currentTween) {
            currentTween.eventCallback('onComplete', () => {
                const tween = gsap.to(curtain, {
                    ...position,
                    ...options.animation,
                    onComplete: () => {
                        tweenMap.delete(curtain);
                    }
                });
                tweenMap.set(curtain, tween);
            });
        } else {
            currentTween = gsap.to(curtain, {
                ...position,
                ...options.animation,
                onComplete: () => {
                    tweenMap.delete(curtain);
                }
            });
            tweenMap.set(curtain, currentTween);
        }
    }
}

export function createMouseHandler(
    action: ActionAnimation,
    curtain: HTMLElement,
    options: typeof defaultOptions
) {
    return (event: Event) => {
        dirHoverHandler({
            action,
            curtain,
            options,
            getDirection: (action, event) => {
                const mouseEvent = event as MouseEvent;
                const element = mouseEvent.currentTarget as Element;
                const rect = element.getBoundingClientRect();
                return detectSide(mouseEvent, rect) as import('./dirHover.types').DirectionalHoverPosition;
            },
            event
        });
    };
}

export function createTouchHandler(
    action: ActionAnimation,
    curtain: HTMLElement,
    options: typeof defaultOptions
) {
    return () => {
        dirHoverHandler({
            action,
            curtain,
            options,
            getDirection: (action) =>
                action === 'in' ? options.touchPosition.start : options.touchPosition.end
        });
    };
}
