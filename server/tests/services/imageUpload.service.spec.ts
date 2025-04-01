import AWS from 'aws-sdk';
import { Readable } from 'stream';
import uploadImageToAWS from '../../services/imageUpload.service';

jest.mock('aws-sdk');

const mockedS3 = AWS.S3.prototype as jest.Mocked<AWS.S3>;

describe('uploadImageToAWS', () => {
  const mockFile: Express.Multer.File = {
    buffer: Buffer.from('dummy file content'),
    originalname: 'test-image.jpg',
    mimetype: 'image/jpeg',
    fieldname: 'file',
    size: 1000,
    encoding: '7bit',
    destination: '',
    filename: '',
    path: '',
    stream: Readable.from(Buffer.from('dummy file content')), // Mocked stream
  };

  const bucketName = process.env.AWS_S3_BUCKET_NAME || 'test-bucket';
  const bucketRegion = process.env.AWS_REGION || 'us-east-1';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    if (mockFile.stream && typeof mockFile.stream.destroy === 'function') {
      mockFile.stream.destroy();
    }
  });

  it('should upload the image to AWS S3 and return the image URL', async () => {
    const mockLocation = 'test_loc.jpeg';
    const mockS3Response = {
      Location: `https://${bucketName}.s3.${bucketRegion}.amazonaws.com/${mockLocation}`,
    };

    mockedS3.upload = jest.fn().mockReturnValue({
      promise: jest.fn().mockResolvedValue(mockS3Response),
    });

    const result = await uploadImageToAWS(mockFile);

    expect(mockedS3.upload).toHaveBeenCalledTimes(1);
    expect(mockedS3.upload).toHaveBeenCalledWith({
      Bucket: bucketName,
      Key: expect.stringContaining(mockFile.originalname),
      Body: mockFile.buffer,
      ContentType: mockFile.mimetype,
    });
    expect(result).toContain(mockFile.originalname);
  });

  it('should return null if the upload fails', async () => {
    mockedS3.upload = jest.fn().mockReturnValue({
      promise: jest.fn().mockRejectedValue(new Error('AWS S3 upload failed')),
    });

    const result = await uploadImageToAWS(mockFile);

    expect(mockedS3.upload).toHaveBeenCalledTimes(1);
    expect(result).toBeNull();
  });
});
