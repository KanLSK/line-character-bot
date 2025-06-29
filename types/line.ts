export interface LineWebhookEvent {
    type: string;
    message?: {
      type: string;
      id: string;
      text: string;
    };
    source: {
      type: string;
      userId: string;
    };
    timestamp: number;
    replyToken: string;
  }
  
export interface LineWebhookBody {
    events: LineWebhookEvent[];
    destination: string;
  }