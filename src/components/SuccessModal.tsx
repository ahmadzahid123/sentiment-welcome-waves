import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, Sparkles, X } from "lucide-react";

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  name: string;
}

export const SuccessModal = ({ isOpen, onClose, name }: SuccessModalProps) => {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setStep(0);
      const timer1 = setTimeout(() => setStep(1), 300);
      const timer2 = setTimeout(() => setStep(2), 1000);
      const timer3 = setTimeout(() => setStep(3), 1800);
      
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
      };
    }
  }, [isOpen]);

  const handleClose = () => {
    setStep(0);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-ai-bg-glass backdrop-blur-xl border-border/20 text-foreground">
        <div className="absolute top-4 right-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="h-6 w-6 p-0 hover:bg-muted/20"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="text-center space-y-6 py-6">
          {/* Success Icon */}
          <div className="flex justify-center">
            <div
              className={`p-4 bg-primary/10 rounded-full transition-all duration-500 ${
                step >= 1 ? "scale-100 opacity-100 animate-glow-pulse" : "scale-50 opacity-0"
              }`}
            >
              <CheckCircle className="w-12 h-12 text-primary" />
            </div>
          </div>

          {/* Main Message */}
          <div
            className={`space-y-2 transition-all duration-500 ${
              step >= 2 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            <h3 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Welcome aboard{name ? `, ${name}` : ""}!
            </h3>
            <p className="text-muted-foreground">
              Your subscription is confirmed and our AI is analyzing your response.
            </p>
          </div>

          {/* AI Processing */}
          <div
            className={`space-y-4 transition-all duration-500 ${
              step >= 3 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            <div className="bg-muted/10 rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2 text-accent">
                <Sparkles className="w-5 h-5 animate-float" />
                <span className="font-medium">AI Analysis Complete</span>
              </div>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>✨ Sentiment analyzed</p>
                <p>📧 Personalized email template selected</p>
                <p>🎯 Welcome experience customized</p>
              </div>
            </div>

            <p className="text-sm text-muted-foreground">
              Check your email for a personalized welcome message tailored just for you!
            </p>

            <Button
              onClick={handleClose}
              className="bg-gradient-primary hover:opacity-90 text-primary-foreground"
            >
              Got it, thanks!
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};