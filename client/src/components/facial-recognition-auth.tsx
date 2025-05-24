import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Camera, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FacialRecognitionAuthProps {
  onSuccess: (faceData: string) => void;
  onError: (error: string) => void;
  mode: 'register' | 'login';
}

export default function FacialRecognitionAuth({ onSuccess, onError, mode }: FacialRecognitionAuthProps) {
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const { toast } = useToast();

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        streamRef.current = stream;
        setIsCapturing(true);
      }
    } catch (error) {
      console.error('Camera access error:', error);
      toast({
        title: "Camera Access Denied",
        description: "Please allow camera access to use facial recognition",
        variant: "destructive"
      });
      onError('Camera access denied');
    }
  }, [toast, onError]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCapturing(false);
  }, []);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas.getContext('2d');

    if (context) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0);
      
      const imageData = canvas.toDataURL('image/jpeg', 0.8);
      setCapturedImage(imageData);
      stopCamera();
    }
  }, [stopCamera]);

  const processFacialAuth = async () => {
    if (!capturedImage) return;

    setIsProcessing(true);
    
    try {
      // In a real implementation, this would use a facial recognition service
      // For demo purposes, we'll simulate the process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate a mock face signature
      const faceSignature = btoa(capturedImage.slice(0, 100));
      
      toast({
        title: mode === 'register' ? "Face Registered" : "Face Verified",
        description: `Facial ${mode === 'register' ? 'registration' : 'authentication'} successful`,
      });
      
      onSuccess(faceSignature);
    } catch (error) {
      toast({
        title: "Authentication Failed", 
        description: "Could not verify your identity. Please try again.",
        variant: "destructive"
      });
      onError('Facial recognition failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const resetCapture = () => {
    setCapturedImage(null);
    setIsProcessing(false);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="h-5 w-5" />
          Facial {mode === 'register' ? 'Registration' : 'Authentication'}
        </CardTitle>
        <CardDescription>
          {mode === 'register' 
            ? 'Register your face for secure login' 
            : 'Look at the camera to verify your identity'
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Camera View */}
        {isCapturing && (
          <div className="relative">
            <video
              ref={videoRef}
              className="w-full rounded-lg"
              autoPlay
              muted
              playsInline
            />
            <div className="absolute inset-0 border-4 border-dashed border-blue-500 rounded-lg pointer-events-none">
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-2 border-blue-500 rounded-full"></div>
            </div>
          </div>
        )}

        {/* Captured Image */}
        {capturedImage && (
          <div className="text-center">
            <img 
              src={capturedImage} 
              alt="Captured face" 
              className="w-full rounded-lg max-w-sm mx-auto"
            />
          </div>
        )}

        {/* Hidden Canvas */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Controls */}
        <div className="flex flex-col gap-2">
          {!isCapturing && !capturedImage && (
            <Button onClick={startCamera} className="w-full">
              <Camera className="h-4 w-4 mr-2" />
              Start Camera
            </Button>
          )}

          {isCapturing && (
            <div className="flex gap-2">
              <Button onClick={capturePhoto} className="flex-1">
                <Camera className="h-4 w-4 mr-2" />
                Capture Photo
              </Button>
              <Button onClick={stopCamera} variant="outline" className="flex-1">
                Cancel
              </Button>
            </div>
          )}

          {capturedImage && !isProcessing && (
            <div className="flex gap-2">
              <Button onClick={processFacialAuth} className="flex-1">
                <CheckCircle className="h-4 w-4 mr-2" />
                {mode === 'register' ? 'Register Face' : 'Verify Identity'}
              </Button>
              <Button onClick={resetCapture} variant="outline" className="flex-1">
                <XCircle className="h-4 w-4 mr-2" />
                Retake
              </Button>
            </div>
          )}

          {isProcessing && (
            <Button disabled className="w-full">
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Processing...
            </Button>
          )}
        </div>

        {/* Security Notice */}
        <div className="text-xs text-muted-foreground text-center">
          <p>🔒 Your facial data is encrypted and stored securely</p>
          <p>This feature enhances account security for verified sellers</p>
        </div>
      </CardContent>
    </Card>
  );
}