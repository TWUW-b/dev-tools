import { describe, it, expect } from 'vitest';
import { computePipPosition } from './pipPosition';

describe('computePipPosition', () => {
  it('places the window at the bottom-right with the default margin when initialPosition is omitted', () => {
    const pos = computePipPosition({
      pipWidth: 420,
      pipHeight: 550,
      screenAvailWidth: 1512,
      screenAvailHeight: 885,
    });
    // 1512 - 420 - 20, 885 - 550 - 20
    expect(pos).toEqual({ x: 1072, y: 315 });
  });

  it('respects a custom margin', () => {
    const pos = computePipPosition({
      pipWidth: 420,
      pipHeight: 550,
      screenAvailWidth: 1512,
      screenAvailHeight: 885,
      margin: 0,
    });
    expect(pos).toEqual({ x: 1092, y: 335 });
  });

  it('prefers an explicit initialPosition over the computed bottom-right position', () => {
    const pos = computePipPosition({
      pipWidth: 420,
      pipHeight: 550,
      screenAvailWidth: 1512,
      screenAvailHeight: 885,
      initialPosition: { x: 100, y: 50 },
    });
    expect(pos).toEqual({ x: 100, y: 50 });
  });

  it('clamps to 0 when the PiP window is larger than the available screen', () => {
    const pos = computePipPosition({
      pipWidth: 2000,
      pipHeight: 1200,
      screenAvailWidth: 1512,
      screenAvailHeight: 885,
    });
    expect(pos).toEqual({ x: 0, y: 0 });
  });
});
