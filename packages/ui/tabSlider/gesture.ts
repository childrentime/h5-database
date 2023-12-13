/**
 * 用户手势判断
 */

export const isSwipeLeft = (dx: number, dy: number, dt: number) => {
    return Math.abs(dx) > Math.abs(dy) && dx < 0 && Math.abs(dx) > 10 && Math.abs(dx / dt) > 0.3;
};

export const isSwipeRight = (dx: number, dy: number, dt: number) => {
    return Math.abs(dx) > Math.abs(dy) && dx > 0 && Math.abs(dx) > 10 && Math.abs(dx / dt) > 0.3;
};

export const isSwipeTop = (dx: number, dy: number, dt: number) => {
    return Math.abs(dx) < Math.abs(dy) && dy < 0 && Math.abs(dx) > 10 && Math.abs(dy / dt) > 0.3;
};

export const isSwipeBottom = (dx: number, dy: number, dt: number) => {
    return Math.abs(dx) < Math.abs(dy) && dy > 0 && Math.abs(dx) > 10 && Math.abs(dy / dt) > 0.3;
};
