import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Phone, ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import Logo from "@/components/Logo";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";

const AuthPage = () => {
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const { toast } = useToast();

  const handleSendOtp = async () => {
    if (phone.length !== 10) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid 10-digit mobile number",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    // Simulate OTP send
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsLoading(false);
    setStep("otp");
    toast({
      title: "OTP Sent!",
      description: "Please enter the 6-digit code sent to your phone",
    });
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

    setIsLoading(true);
    // Simulate OTP verification
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    // For demo: any 6-digit OTP works
    login(phone);
    setIsLoading(false);
    
    toast({
      title: "Welcome to SmartStay!",
      description: "You have successfully logged in",
    });
    
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen gradient-hero flex flex-col">
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
                  />
                </div>

                <Button
                  onClick={handleSendOtp}
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
                <button className="text-primary font-medium hover:underline">
                  Resend OTP
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
