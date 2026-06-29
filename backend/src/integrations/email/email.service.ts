import { EmailClient } from './email.client';
import { EmailMessage } from './email.types';

export class EmailService {
  constructor(private readonly client: EmailClient) {}

  async send(message: EmailMessage): Promise<void> {
    await this.client.send(message);
  }
}
