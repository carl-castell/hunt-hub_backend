import { describe, it, expect, vi, beforeEach } from 'vitest';

const { MockS3Client, mockSend } = vi.hoisted(() => {
  const mockSend = vi.fn().mockResolvedValue({});
  class MockS3Client { send = mockSend; }
  return { MockS3Client, mockSend };
});

vi.mock('@aws-sdk/client-s3', () => ({
  S3Client:            MockS3Client,
  PutObjectCommand:    vi.fn(),
  DeleteObjectCommand: vi.fn(),
}));

import { uploadFile, deleteFile, BUCKET } from '@/services/storage';
import { PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

beforeEach(() => vi.clearAllMocks());

describe('uploadFile', () => {
  it('constructs a PutObjectCommand with the correct params and sends it', async () => {
    const buffer = Buffer.from('file data');
    await uploadFile('images/photo.jpg', buffer, 'image/jpeg');

    expect(PutObjectCommand).toHaveBeenCalledWith({
      Bucket:      BUCKET,
      Key:         'images/photo.jpg',
      Body:        buffer,
      ContentType: 'image/jpeg',
    });
    expect(mockSend).toHaveBeenCalledTimes(1);
  });
});

describe('deleteFile', () => {
  it('constructs a DeleteObjectCommand with the correct params and sends it', async () => {
    await deleteFile('images/photo.jpg');

    expect(DeleteObjectCommand).toHaveBeenCalledWith({
      Bucket: BUCKET,
      Key:    'images/photo.jpg',
    });
    expect(mockSend).toHaveBeenCalledTimes(1);
  });
});
