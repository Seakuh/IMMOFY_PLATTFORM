import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ImageService {
  private readonly s3Client: S3Client;
  private readonly bucketName: string;
  private readonly endpoint: string;

  constructor(private configService: ConfigService) {
    const accessKey = this.configService.get<string>('HETZNER_ACCESS_KEY');
    const secretKey = this.configService.get<string>('HETZNER_SECRET_KEY');
    this.bucketName =
      this.configService.get<string>('HETZNER_BUCKET_NAME') || 'imagebucket';
    this.endpoint =
      this.configService.get<string>('HETZNER_ENDPOINT') ||
      'https://hel1.your-objectstorage.com';

    if (!accessKey || !secretKey) {
      console.error('Missing Hetzner credentials');
    }

    this.s3Client = new S3Client({
      region: 'eu-central-1',
      endpoint: this.endpoint,
      credentials: {
        accessKeyId: accessKey,
        secretAccessKey: secretKey,
      },
      forcePathStyle: true,
    });
  }

  async uploadImageFromBuffer(imageBuffer: Buffer): Promise<string> {
    try {
      const fileExtension = 'jpg';
      const fileName = `${uuidv4()}.${fileExtension}`;

      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: `events/${fileName}`,
        Body: imageBuffer,
        ContentType: 'image/jpeg',
        ACL: 'public-read',
      });

      await this.s3Client.send(command);

      return `${this.endpoint}/${this.bucketName}/events/${fileName}`;
    } catch (error) {
      console.error('Failed to upload image:', error);
      throw new Error(`Failed to upload image: ${error.message}`);
    }
  }

  async uploadImage(image: Express.Multer.File): Promise<string> {
    try {
      const fileExtension = image.originalname.split('.').pop() || 'jpg';
      const fileName = `${uuidv4()}.${fileExtension}`;

      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: `events/${fileName}`,
        Body: image.buffer,
        ContentType: image.mimetype,
        ACL: 'public-read',
      });

      await this.s3Client.send(command);

      return `${this.endpoint}/${this.bucketName}/events/${fileName}`;
    } catch (error) {
      console.error('Failed to upload image:', error);
      throw new Error(`Failed to upload image: ${error.message}`);
    }
  }
}
