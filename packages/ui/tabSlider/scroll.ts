export function setScrollTop(value: number, node?: HTMLElement) {
  if (node && node !== document.body) {
    node.scrollTop = value;
    return;
  }
  if (value === 0) {
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
    return;
  }
  document.body.scrollTop = value;
  if (document.body.scrollTop !== 0) {
    return;
  }
  document.documentElement.scrollTop = value;
}

