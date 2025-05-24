import crypto from "crypto";

interface MpesaPaymentRequest {
  phoneNumber: string;
  amount: number;
  accountReference: string;
  transactionDesc: string;
}

interface MpesaCallbackData {
  Body: {
    stkCallback: {
      MerchantRequestID: string;
      CheckoutRequestID: string;
      ResultCode: number;
      ResultDesc: string;
      CallbackMetadata?: {
        Item: Array<{
          Name: string;
          Value: string | number;
        }>;
      };
    };
  };
}

export class MpesaIntegration {
  private consumerKey: string;
  private consumerSecret: string;
  private businessShortCode: string;
  private passkey: string;
  private baseUrl: string;

  constructor() {
    // These would be set via environment variables in production
    this.consumerKey = process.env.MPESA_CONSUMER_KEY || "";
    this.consumerSecret = process.env.MPESA_CONSUMER_SECRET || "";
    this.businessShortCode = process.env.MPESA_BUSINESS_SHORT_CODE || "174379";
    this.passkey = process.env.MPESA_PASSKEY || "";
    this.baseUrl = process.env.MPESA_ENVIRONMENT === "production" 
      ? "https://api.safaricom.co.ke" 
      : "https://sandbox.safaricom.co.ke";
  }

  async getAccessToken(): Promise<string> {
    const auth = Buffer.from(`${this.consumerKey}:${this.consumerSecret}`).toString('base64');
    
    try {
      const response = await fetch(`${this.baseUrl}/oauth/v1/generate?grant_type=client_credentials`, {
        method: "GET",
        headers: {
          "Authorization": `Basic ${auth}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to get access token: ${response.statusText}`);
      }

      const data = await response.json();
      return data.access_token;
    } catch (error) {
      console.error("M-Pesa access token error:", error);
      throw new Error("Failed to authenticate with M-Pesa");
    }
  }

  async initiateSTKPush(paymentRequest: MpesaPaymentRequest): Promise<any> {
    const accessToken = await this.getAccessToken();
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3);
    const password = Buffer.from(`${this.businessShortCode}${this.passkey}${timestamp}`).toString('base64');

    const stkPushData = {
      BusinessShortCode: this.businessShortCode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: paymentRequest.amount,
      PartyA: paymentRequest.phoneNumber,
      PartyB: this.businessShortCode,
      PhoneNumber: paymentRequest.phoneNumber,
      CallBackURL: `${process.env.APP_URL}/api/mpesa/callback`,
      AccountReference: paymentRequest.accountReference,
      TransactionDesc: paymentRequest.transactionDesc,
    };

    try {
      const response = await fetch(`${this.baseUrl}/mpesa/stkpush/v1/processrequest`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(stkPushData),
      });

      if (!response.ok) {
        throw new Error(`STK Push failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("M-Pesa STK Push error:", error);
      throw new Error("Failed to initiate M-Pesa payment");
    }
  }

  processCallback(callbackData: MpesaCallbackData): {
    success: boolean;
    transactionId?: string;
    amount?: number;
    phoneNumber?: string;
    error?: string;
  } {
    const { stkCallback } = callbackData.Body;
    
    if (stkCallback.ResultCode === 0) {
      // Payment successful
      const metadata = stkCallback.CallbackMetadata?.Item || [];
      const transactionId = metadata.find(item => item.Name === "MpesaReceiptNumber")?.Value as string;
      const amount = metadata.find(item => item.Name === "Amount")?.Value as number;
      const phoneNumber = metadata.find(item => item.Name === "PhoneNumber")?.Value as string;

      return {
        success: true,
        transactionId,
        amount,
        phoneNumber,
      };
    } else {
      // Payment failed
      return {
        success: false,
        error: stkCallback.ResultDesc,
      };
    }
  }

  formatPhoneNumber(phone: string): string {
    // Convert phone number to M-Pesa format (254XXXXXXXXX)
    let formatted = phone.replace(/\D/g, ''); // Remove non-digits
    
    if (formatted.startsWith('0')) {
      formatted = '254' + formatted.slice(1);
    } else if (formatted.startsWith('7') || formatted.startsWith('1')) {
      formatted = '254' + formatted;
    } else if (!formatted.startsWith('254')) {
      formatted = '254' + formatted;
    }
    
    return formatted;
  }

  validatePhoneNumber(phone: string): boolean {
    const formatted = this.formatPhoneNumber(phone);
    return /^254[71][0-9]{8}$/.test(formatted);
  }
}

// Utility functions for M-Pesa transactions
export const createMpesaTransaction = {
  carDeposit: (carId: number, amount: number) => ({
    accountReference: `CAR-${carId}`,
    transactionDesc: `Car deposit for listing ${carId}`,
    amount,
  }),
  
  premiumUpgrade: (userId: number, duration: string) => ({
    accountReference: `PREMIUM-${userId}`,
    transactionDesc: `Premium seller upgrade - ${duration}`,
    amount: duration === '1month' ? 2000 : duration === '3months' ? 5000 : 15000,
  }),
  
  carPayment: (carId: number, amount: number) => ({
    accountReference: `PAYMENT-${carId}`,
    transactionDesc: `Car purchase payment for listing ${carId}`,
    amount,
  }),
};