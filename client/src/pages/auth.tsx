import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Eye, EyeOff, Shield, User, Building } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import FacialRecognitionAuth from '@/components/facial-recognition-auth';

export default function AuthPage() {
  const [, setLocation] = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showFacialAuth, setShowFacialAuth] = useState(false);
  const { toast } = useToast();

  // Login form state
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });

  // Register form state
  const [registerData, setRegisterData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    location: '',
    userType: 'individual',
    businessName: '',
    bio: ''
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await apiRequest('POST', '/api/auth/login', loginData);
      
      if (response.ok) {
        toast({
          title: "Welcome back!",
          description: "You have successfully signed in."
        });
        setLocation('/');
      } else {
        const error = await response.json();
        toast({
          title: "Sign In Failed",
          description: error.message || "Invalid credentials",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Connection Error",
        description: "Unable to connect to server. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (registerData.password !== registerData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const { confirmPassword, ...dataToSend } = registerData;
      const response = await apiRequest('POST', '/api/auth/register', dataToSend);
      
      if (response.ok) {
        toast({
          title: "Account Created!",
          description: "Welcome to CarHub Kenya. You can now sign in."
        });
        setLocation('/');
      } else {
        const error = await response.json();
        toast({
          title: "Registration Failed",
          description: error.message || "Failed to create account",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Connection Error",
        description: "Unable to connect to server. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFacialAuthSuccess = (faceData: string) => {
    toast({
      title: "Facial Authentication Complete",
      description: "Your face has been registered for secure login"
    });
    setShowFacialAuth(false);
  };

  const handleFacialAuthError = (error: string) => {
    toast({
      title: "Facial Authentication Failed",
      description: error,
      variant: "destructive"
    });
    setShowFacialAuth(false);
  };

  const counties = [
    "Nairobi", "Mombasa", "Kisumu", "Nakuru", "Eldoret", "Thika", "Malindi", "Kitale",
    "Garissa", "Kakamega", "Machakos", "Meru", "Nyeri", "Kericho", "Embu", "Migori",
    "Homa Bay", "Naivasha", "Voi", "Kilifi", "Lamu", "Isiolo", "Marsabit", "Wajir"
  ];

  if (showFacialAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
        <FacialRecognitionAuth
          mode="register"
          onSuccess={handleFacialAuthSuccess}
          onError={handleFacialAuthError}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-blue-600">CarHub Kenya</CardTitle>
          <CardDescription>
            Join Kenya's premier automotive marketplace
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Sign In</TabsTrigger>
              <TabsTrigger value="register">Sign Up</TabsTrigger>
            </TabsList>

            {/* Login Tab */}
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="your@email.com"
                    value={loginData.email}
                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <div className="relative">
                    <Input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Signing In..." : "Sign In"}
                </Button>
              </form>
              
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-600">Demo Accounts:</p>
                <div className="text-xs space-y-1">
                  <p>john.dealer@automart.co.ke - password123</p>
                  <p>sarah.seller@gmail.com - password123</p>
                  <p>peter.motors@outlook.com - password123</p>
                </div>
              </div>
            </TabsContent>

            {/* Register Tab */}
            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={registerData.firstName}
                      onChange={(e) => setRegisterData({ ...registerData, firstName: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={registerData.lastName}
                      onChange={(e) => setRegisterData({ ...registerData, lastName: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-email">Email</Label>
                  <Input
                    id="register-email"
                    type="email"
                    value={registerData.email}
                    onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    placeholder="+254712345678"
                    value={registerData.phone}
                    onChange={(e) => setRegisterData({ ...registerData, phone: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Select onValueChange={(value) => setRegisterData({ ...registerData, location: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your county" />
                    </SelectTrigger>
                    <SelectContent>
                      {counties.map((county) => (
                        <SelectItem key={county} value={county}>
                          {county}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="userType">Account Type</Label>
                  <Select onValueChange={(value) => setRegisterData({ ...registerData, userType: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select account type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="individual">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          Individual Seller
                        </div>
                      </SelectItem>
                      <SelectItem value="dealer">
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4" />
                          Car Dealer
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {registerData.userType === 'dealer' && (
                  <div className="space-y-2">
                    <Label htmlFor="businessName">Business Name</Label>
                    <Input
                      id="businessName"
                      value={registerData.businessName}
                      onChange={(e) => setRegisterData({ ...registerData, businessName: e.target.value })}
                      placeholder="Your dealership name"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="register-password">Password</Label>
                  <Input
                    id="register-password"
                    type="password"
                    value={registerData.password}
                    onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={registerData.confirmPassword}
                    onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                    required
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Creating Account..." : "Create Account"}
                </Button>

                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setShowFacialAuth(true)}
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Enable Facial Recognition
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}