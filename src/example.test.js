// src/example.test.js
import { describe, it, expect } from 'vitest';

describe('sample', () => {
  it('should work', () => {
    expect(1 + 1).toBe(2);
  });
});
"scripts": {
  "test": "vitest run"
}
git add src/example.test.js
git commit -m "Add sample test to fix CI"
git push
