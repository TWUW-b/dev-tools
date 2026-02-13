import { describe, it, expect } from 'vitest';
import { maskSensitive } from './maskSensitive';

describe('maskSensitive', () => {
  it('should mask Authorization header', () => {
    const input = 'Authorization: Bearer abc123xyz';
    const result = maskSensitive(input);
    expect(result).toBe('Authorization: Bearer [MASKED]');
  });

  it('should mask Cookie header', () => {
    const input = 'Cookie: session=abc123; user=test';
    const result = maskSensitive(input);
    expect(result).toBe('Cookie: [MASKED]');
  });

  it('should mask Set-Cookie header', () => {
    const input = 'Set-Cookie: session=abc123; HttpOnly';
    const result = maskSensitive(input);
    expect(result).toBe('Set-Cookie: [MASKED]');
  });

  it('should mask JWT tokens', () => {
    const jwt = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U';
    const input = `Token: ${jwt}`;
    const result = maskSensitive(input);
    expect(result).toBe('Token: [JWT_MASKED]');
  });

  it('should mask email addresses', () => {
    const input = 'User email: test@example.com';
    const result = maskSensitive(input);
    expect(result).toBe('User email: [EMAIL_MASKED]');
  });

  it('should mask phone numbers', () => {
    const input = '電話: 03-1234-5678';
    const result = maskSensitive(input);
    expect(result).toBe('電話: [PHONE_MASKED]');
  });

  it('should mask mobile phone numbers', () => {
    const input = '携帯: 090-1234-5678';
    const result = maskSensitive(input);
    expect(result).toBe('携帯: [PHONE_MASKED]');
  });

  it('should mask multiple sensitive data', () => {
    const input = `
      Authorization: Bearer secret123
      Email: user@test.com
      Phone: 03-1234-5678
    `;
    const result = maskSensitive(input);
    expect(result).toContain('[MASKED]');
    expect(result).toContain('[EMAIL_MASKED]');
    expect(result).toContain('[PHONE_MASKED]');
    expect(result).not.toContain('secret123');
    expect(result).not.toContain('user@test.com');
  });

  it('should not mask regular text', () => {
    const input = 'This is a normal log message';
    const result = maskSensitive(input);
    expect(result).toBe('This is a normal log message');
  });
});
