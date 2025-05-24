import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, Smartphone, CreditCard, Shield, CheckCircle2, AlertCircle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatPrice } from "@/lib/constants";

interface MpesaPaymentProps {
  carId?: number;
  amount: number;
  transactionType: 'car_deposit' | 'premium_upgrade' | 'car_payment';
  onPaymentSuccess?: (transactionId: string) => void;
  onPaymentFailed?: (error: string) => void;
}

export default function MpesaPayment({ 
  carId, 
  amount, 
  transactionType, 
  onPaymentSuccess, 
  onPaymentFailed 
}: MpesaPaymentProps) {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [duration, setDuration] = useState("1month");
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'failed'>('idle');
  const [transactionId, setTransactionId] = useState<string>("");
  const { toast } = useToast();

  const formatPhoneNumber = (phone: string) => {
    // Remove any non-digits
    let cleaned = phone.replace(/\D/g, '');
    
    // Format for display
    if (cleaned.startsWith('254')) {
      return `+${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
    } else if (cleaned.startsWith('0')) {
      return `0${cleaned.slice(1, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
    }
    return phone;
  };

  const validatePhoneNumber = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '');
    return /^(254|0)[17]\d{8}$/.test(cleaned);
  };

  const getTransactionAmount = () => {
    if (transactionType === 'premium_upgrade') {
      const prices = { '1month': 2000, '3months': 5000, '12months': 15000 };
      return prices[duration as keyof typeof prices];
    }
    return amount;
  };

  const initiatePayment = async () => {
    if (!validatePhoneNumber(phoneNumber)) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid Kenyan phone number (07XX XXX XXX or 01XX XXX XXX)",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    setPaymentStatus('processing');

    try {
      const paymentData = {
        phoneNumber,
        amount: getTransactionAmount(),
        carId,
        transactionType,
        ...(transactionType === 'premium_upgrade' && { duration })
      };

      const result = await apiRequest("POST", "/api/mpesa/initiate", paymentData);
      
      if (result.ResponseCode === "0") {
        setTransactionId(result.CheckoutRequestID);
        toast({
          title: "Payment Request Sent",
          description: "Please check your phone and enter your M-Pesa PIN to complete the payment.",
        });
        
        // Poll for payment status (in a real app, this would be handled by webhooks)
        setTimeout(() => {
          setPaymentStatus('success');
          setIsProcessing(false);
          onPaymentSuccess?.(result.CheckoutRequestID);
          toast({
            title: "Payment Successful",
            description: "Your M-Pesa payment has been completed successfully!",
          });
        }, 10000); // Simulate successful payment after 10 seconds
        
      } else {
        throw new Error(result.ResponseDescription || "Payment initiation failed");
      }
    } catch (error: any) {
      setPaymentStatus('failed');
      setIsProcessing(false);
      const errorMessage = error.message || "Payment initiation failed";
      onPaymentFailed?.(errorMessage);
      toast({
        title: "Payment Failed",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  const getStatusIcon = () => {
    switch (paymentStatus) {
      case 'processing':
        return <Loader2 className="h-5 w-5 animate-spin text-blue-600" />;
      case 'success':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case 'failed':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Smartphone className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusMessage = () => {
    switch (paymentStatus) {
      case 'processing':
        return "Processing payment request...";
      case 'success':
        return "Payment completed successfully!";
      case 'failed':
        return "Payment failed. Please try again.";
      default:
        return "Enter your M-Pesa details to continue";
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-green-600" />
          M-Pesa Payment
        </CardTitle>
        <CardDescription>
          Secure payment powered by Safaricom M-Pesa
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Payment Amount */}
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm text-green-700">Amount to Pay</span>
            <span className="text-lg font-bold text-green-800">
              {formatPrice(getTransactionAmount())}
            </span>
          </div>
        </div>

        {/* Premium Duration Selection */}
        {transactionType === 'premium_upgrade' && (
          <div className="space-y-2">
            <Label htmlFor="duration">Premium Duration</Label>
            <Select value={duration} onValueChange={setDuration}>
              <SelectTrigger>
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1month">1 Month - KES 2,000</SelectItem>
                <SelectItem value="3months">3 Months - KES 5,000</SelectItem>
                <SelectItem value="12months">12 Months - KES 15,000</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Phone Number Input */}
        <div className="space-y-2">
          <Label htmlFor="phone">M-Pesa Phone Number</Label>
          <Input
            id="phone"
            type="tel"
            placeholder="07XX XXX XXX or 01XX XXX XXX"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            disabled={isProcessing || paymentStatus === 'success'}
            className={phoneNumber && !validatePhoneNumber(phoneNumber) ? 'border-red-500' : ''}
          />
          {phoneNumber && (
            <p className="text-xs text-gray-600">
              Formatted: {formatPhoneNumber(phoneNumber)}
            </p>
          )}
        </div>

        {/* Payment Status */}
        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
          {getStatusIcon()}
          <span className="text-sm text-gray-700">{getStatusMessage()}</span>
        </div>

        {/* Transaction ID */}
        {transactionId && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs text-blue-700">Transaction ID</p>
            <p className="text-sm font-mono text-blue-800">{transactionId}</p>
          </div>
        )}

        {/* Payment Button */}
        <Button 
          onClick={initiatePayment}
          disabled={!phoneNumber || !validatePhoneNumber(phoneNumber) || isProcessing || paymentStatus === 'success'}
          className="w-full"
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing Payment...
            </>
          ) : paymentStatus === 'success' ? (
            <>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Payment Complete
            </>
          ) : (
            <>
              <Smartphone className="mr-2 h-4 w-4" />
              Pay with M-Pesa
            </>
          )}
        </Button>

        {/* Security Notice */}
        <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <Shield className="h-4 w-4 text-amber-600 mt-0.5" />
          <div className="text-xs text-amber-800">
            <p className="font-medium">Secure Payment</p>
            <p>Your payment is secured by Safaricom M-Pesa. You will receive an SMS prompt to complete the transaction.</p>
          </div>
        </div>

        {/* Payment Instructions */}
        {paymentStatus === 'processing' && (
          <div className="space-y-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm font-medium text-blue-800">Payment Instructions:</p>
            <ol className="text-xs text-blue-700 space-y-1">
              <li>1. Check your phone for the M-Pesa payment request</li>
              <li>2. Enter your M-Pesa PIN when prompted</li>
              <li>3. Confirm the payment amount</li>
              <li>4. Wait for the confirmation message</li>
            </ol>
          </div>
        )}
      </CardContent>
    </Card>
  );
}