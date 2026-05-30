import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Phone, ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import Logo from "@/components/Logo";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { verifyOtpRequest } from "@/lib/api";
import { auth, RecaptchaVerifier, signInWithPhoneNumber } from "@/lib/firebase";

const AuthPage = () => {
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [timer, setTimer] = useState(0);
  const [confirmationResult, setConfirmationResult] = useState<any>(null);
  const navigate = useNavigate();
  const { login } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    let interval: any;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  useEffect(() => {
    // Initialize reCAPTCHA verifier only once on mount
    if (!(window as any).recaptchaVerifier) {
      console.log("[FIREBASE] Initializing RecaptchaVerifier...");
      try {
        (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
          size: "normal",
          callback: (response: any) => {
            console.log("[FIREBASE] reCAPTCHA solved successfully.");
          },
          "expired-callback": () => {
            console.warn("[FIREBASE] reCAPTCHA expired. Please try again.");
          }
        });
      } catch (error) {
        console.error("[FIREBASE] Error initializing reCAPTCHA:", error);
      }
    }

    return () => {
      if ((window as any).recaptchaVerifier) {
        console.log("[FIREBASE] Cleaning up RecaptchaVerifier.");
        (window as any).recaptchaVerifier.clear();
        (window as any).recaptchaVerifier = null;
      }
    };
  }, []);

  const handleSendOtp = async (isResend = false) => {
    // 1. Normalize phone number (handle 10 digits or 12 digits with 91)
    let cleanPhone = phone.replace(/\D/g, "");
    
    // If user typed 12 digits starting with 91, extract the last 10
    if (cleanPhone.length === 12 && cleanPhone.startsWith("91")) {
      cleanPhone = cleanPhone.substring(2);
    }

    if (cleanPhone.length !== 10) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid 10-digit mobile number",
        variant: "destructive",
      });
      return;
    }

    // Prevent duplicate clicks while loading
    if (isLoading) return;

    setIsLoading(true);
    console.log(`[DEBUG] Final Normalized Phone: +91${cleanPhone}`);

    try {
      // ==========================================
      // TEMPORARY DEMO BYPASS FOR RAZORPAY REVIEW
      // ==========================================
      console.log("[DEMO MODE] Global OTP bypass active for Razorpay verification");
      
      setConfirmationResult({ 
        isMock: true,
        confirm: async (verificationCode: string) => {
          if (verificationCode === "123456") {
            console.log("[DEMO MODE] Demo OTP 123456 verified.");
            return { 
              user: { 
                getIdToken: async () => `MOCK_TOKEN_${cleanPhone}` 
              } 
            };
          }
          throw new Error("Invalid demo OTP code. Use 123456.");
        }
      });
      
      setStep("otp");
      setTimer(60);
      setIsLoading(false);
      toast({
        title: "Demo Mode Active",
        description: "Enter 123456 to continue (Razorpay Verification)",
      });
      return; 
      // ==========================================

      /* ORIGINAL FIREBASE CODE PRESERVED BELOW
      // 2. STAGE 1: EXHAUSTIVE CLEANUP ...
      */
      
      console.log("[SUCCESS] Firebase accepted the request. SMS triggered.");
      setConfirmationResult(confirmation);
      
      if (!isResend) setStep("otp");
      setTimer(60); 
      toast({
        title: isResend ? "OTP Resent!" : "OTP Sent!",
        description: "Please enter the 6-digit code sent to your phone",
      });
    } catch (error: any) {
      console.error("[FIREBASE] Full Auth Error:", error);
      
      let friendlyMessage = error.message || "Failed to send OTP";
      
      if (error.code === 'auth/invalid-phone-number') {
        friendlyMessage = "The phone number is invalid. Check format.";
      } else if (error.code === 'auth/quota-exceeded') {
        friendlyMessage = "SMS quota exceeded for this project.";
      } else if (error.code === 'auth/too-many-requests') {
        friendlyMessage = "Too many requests. Please try again later.";
      } else if (error.code === 'auth/captcha-check-failed') {
        friendlyMessage = "reCAPTCHA verification failed. Please refresh.";
      } else if (error.code === 'auth/invalid-app-credential') {
        friendlyMessage = "Firebase setup error: Authorized domains missing.";
      } else if (error.code === 'auth/operation-not-allowed') {
        friendlyMessage = "SMS Region Policy error: Please check Firebase Console.";
      }

      toast({
        title: "OTP Delivery Failed",
        description: friendlyMessage,
        variant: "destructive",
      });

      // Cleanup on failure to allow immediate retry
      if ((window as any).recaptchaVerifier) {
        try {
          (window as any).recaptchaVerifier.clear();
          (window as any).recaptchaVerifier = null;
        } catch (e) {}
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      toast({
        title: "Invalid OTP",
        description: "Please enter the complete 6-digit OTP",
        variant: "destructive",
      });
      return;
    }

    if (!confirmationResult) {
      toast({
        title: "Error",
        description: "Please request a new OTP",
        variant: "destructive",
      });
      setStep("phone");
      return;
    }

    setIsLoading(true);
    try {
      // 1. Verify OTP with Firebase
      const result = await confirmationResult.confirm(otp);
      const user = result.user;
      
      // 2. Get ID Token
      const idToken = await user.getIdToken();
      
      // 3. Verify with our backend
      const response = await verifyOtpRequest(idToken);
      
      if (response.success) {
        login(response.accessToken, response.user);
        toast({
          title: "Welcome to SmartStay!",
          description: "You have successfully logged in",
        });
        navigate("/dashboard");
      }
    } catch (error: any) {
      toast({
        title: "Verification Failed",
        description: error.message || "Invalid OTP",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-hero flex flex-col">
      {/* Invisible Recaptcha Container */}
      <div id="recaptcha-container"></div>
      
      {/* Header */}
      <div className="pt-12 pb-8 text-center animate-fade-in">
        <div className="flex justify-center mb-6">
          <Logo size="lg" />
        </div>
        <p className="text-muted-foreground mt-2">
          Find your perfect room, hassle-free
        </p>
      </div>

      {/* Auth Card */}
      <div className="flex-1 flex items-start justify-center px-4 pt-8">
        <div className="w-full max-w-md bg-card rounded-2xl card-shadow p-8 animate-slide-up">
          {step === "phone" ? (
            <>
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Phone className="text-primary" size={28} />
                </div>
                <h2 className="text-2xl font-bold text-foreground">
                  Login / Register
                </h2>
                <p className="text-muted-foreground mt-2">
                  Enter your mobile number to continue
                </p>
              </div>

              <div className="space-y-6">
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                    +91
                  </div>
                  <Input
                    type="tel"
                    placeholder="Enter mobile number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    className="pl-14 h-14 text-lg"
                    maxLength={10}
                    inputMode="tel"
                    autoComplete="tel"
                  />
                </div>

                <Button
                  onClick={() => handleSendOtp(false)}
                  disabled={isLoading || phone.length !== 10}
                  className="w-full h-14 text-lg font-semibold btn-shadow"
                >
                  {isLoading ? "Sending..." : "Get OTP"}
                  <ArrowRight className="ml-2" size={20} />
                </Button>
              </div>

              <p className="text-center text-sm text-muted-foreground mt-6">
                By continuing, you agree to our Terms of Service and Privacy Policy
              </p>
            </>
          ) : (
            <>
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShieldCheck className="text-accent" size={28} />
                </div>
                <h2 className="text-2xl font-bold text-foreground">
                  Verify OTP
                </h2>
                <p className="text-muted-foreground mt-2">
                  Enter the 6-digit code sent to +91 {phone}
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex justify-center">
                  <InputOTP
                    value={otp}
                    onChange={setOtp}
                    maxLength={6}
                    inputMode="numeric"
                    autoComplete="one-time-code"
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} className="w-12 h-14 text-xl" />
                      <InputOTPSlot index={1} className="w-12 h-14 text-xl" />
                      <InputOTPSlot index={2} className="w-12 h-14 text-xl" />
                      <InputOTPSlot index={3} className="w-12 h-14 text-xl" />
                      <InputOTPSlot index={4} className="w-12 h-14 text-xl" />
                      <InputOTPSlot index={5} className="w-12 h-14 text-xl" />
                    </InputOTPGroup>
                  </InputOTP>
                </div>

                <Button
                  onClick={handleVerifyOtp}
                  disabled={isLoading || otp.length !== 6}
                  className="w-full h-14 text-lg font-semibold btn-shadow"
                >
                  {isLoading ? "Verifying..." : "Verify & Continue"}
                </Button>

                <button
                  onClick={() => setStep("phone")}
                  className="w-full text-center text-primary font-medium hover:underline"
                >
                  Change phone number
                </button>
              </div>

              <p className="text-center text-sm text-muted-foreground mt-6">
                Didn't receive the code?{" "}
                <button 
                  onClick={() => handleSendOtp(true)}
                  disabled={isLoading || timer > 0}
                  className="text-primary font-medium hover:underline disabled:text-muted-foreground disabled:no-underline"
                >
                  {timer > 0 ? `Resend OTP in ${timer}s` : "Resend OTP"}
                </button>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
