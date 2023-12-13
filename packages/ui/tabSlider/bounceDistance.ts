export function bounceDistance(
  min: number,
  max: number,
  value: number,
  maxBounceDistance: number,
  bounceRate = 10
) {
  if (value < min) {
    return min - Math.min((min - value) / bounceRate, maxBounceDistance);
  }

  if (value > max) {
    return max + Math.min((value - max) / bounceRate, maxBounceDistance);
  }

  return value;
}
