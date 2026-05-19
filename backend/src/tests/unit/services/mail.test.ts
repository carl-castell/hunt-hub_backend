import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockSendMail, mockRenderFile } = vi.hoisted(() => ({
  mockSendMail:   vi.fn().mockResolvedValue({ messageId: 'test-id' }),
  mockRenderFile: vi.fn().mockResolvedValue('<html>rendered</html>'),
}));

vi.mock('nodemailer', () => ({
  default: { createTransport: vi.fn().mockReturnValue({ sendMail: mockSendMail }) },
}));

vi.mock('nodemailer-mailgun-transport', () => ({
  default: vi.fn().mockReturnValue({}),
}));

vi.mock('ejs', () => ({
  default: { renderFile: mockRenderFile },
}));

import { renderTemplate, sendMail } from '@/services/mail';

beforeEach(() => vi.clearAllMocks());

describe('renderTemplate', () => {
  it('calls ejs.renderFile with the correct template path and data', async () => {
    const data = { name: 'Alice', link: 'https://example.com' };
    const result = await renderTemplate('invitation', data);

    expect(mockRenderFile).toHaveBeenCalledWith(
      expect.stringContaining('invitation.ejs'),
      data,
    );
    expect(result).toBe('<html>rendered</html>');
  });
});

describe('sendMail', () => {
  it('sends an email with the correct to, subject, and html', async () => {
    await sendMail({ to: 'user@test.com', subject: 'Hello', html: '<p>Hi</p>' });

    expect(mockSendMail).toHaveBeenCalledWith(expect.objectContaining({
      to:      'user@test.com',
      subject: 'Hello',
      html:    '<p>Hi</p>',
    }));
  });

  it('uses "Hunt Hub" as the default sender name', async () => {
    await sendMail({ to: 'user@test.com', subject: 'Test', html: '<p>Hi</p>' });

    expect(mockSendMail).toHaveBeenCalledWith(expect.objectContaining({
      from: expect.stringContaining('Hunt Hub'),
    }));
  });

  it('uses a custom fromName when provided', async () => {
    await sendMail({ to: 'user@test.com', subject: 'Test', html: '<p>Hi</p>', fromName: 'HuntHub Admin' });

    expect(mockSendMail).toHaveBeenCalledWith(expect.objectContaining({
      from: expect.stringContaining('HuntHub Admin'),
    }));
  });
});
