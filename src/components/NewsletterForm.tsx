import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Sparkles, Brain, Mail } from "lucide-react";
import { SuccessModal } from "./SuccessModal";

export const NewsletterForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    reason: ""
  });
  const [isVisible, setIsVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    const formElement = document.getElementById("newsletter-form");
    if (formElement) {
      observer.observe(formElement);
    }

    return () => observer.disconnect();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call for now
    setTimeout(() => {
      setIsSubmitting(false);
      setShowSuccess(true);
      setFormData({ name: "", email: "", reason: "" });
    }, 2000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <>
      <div
        id="newsletter-form"
        className={`transition-all duration-1000 ${
          isVisible ? "animate-fade-in-up" : "opacity-0 translate-y-8"
        }`}
      >
        <Card className="relative bg-ai-bg-glass backdrop-blur-xl border-border/20 shadow-card overflow-hidden">
          {/* Animated background gradient */}
          <div className="absolute inset-0 bg-gradient-glow opacity-30 animate-glow-pulse" />
          
          <div className="relative p-8 space-y-6">
            {/* Header */}
            <div className="text-center space-y-3">
              <div className="flex justify-center">
                <div className="p-3 bg-primary/10 rounded-full animate-float">
                  <Brain className="w-8 h-8 text-primary" />
                </div>
              </div>
              <h2 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                AI-Powered Newsletter
              </h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                Join our community and tell us why you're interested. Our AI will personalize your welcome experience.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-foreground">Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Your name"
                    required
                    className="bg-input/50 border-border/50 focus:border-primary focus:shadow-input transition-all duration-300"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-foreground">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="your@email.com"
                    required
                    className="bg-input/50 border-border/50 focus:border-primary focus:shadow-input transition-all duration-300"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="reason" className="text-foreground flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-accent" />
                  Why are you subscribing?
                </Label>
                <Textarea
                  id="reason"
                  name="reason"
                  value={formData.reason}
                  onChange={handleChange}
                  placeholder="Tell us what interests you about our newsletter... Our AI will analyze your response and personalize your experience!"
                  required
                  rows={4}
                  className="bg-input/50 border-border/50 focus:border-primary focus:shadow-input transition-all duration-300 resize-none"
                />
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-primary hover:opacity-90 text-primary-foreground font-semibold py-3 transition-all duration-300 transform hover:scale-[1.02] disabled:scale-100"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Analyzing with AI...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Subscribe & Get AI-Personalized Welcome
                  </div>
                )}
              </Button>
            </form>

            {/* Features */}
            <div className="pt-4 border-t border-border/20">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div className="space-y-1">
                  <Brain className="w-5 h-5 text-accent mx-auto" />
                  <p className="text-xs text-muted-foreground">AI Sentiment Analysis</p>
                </div>
                <div className="space-y-1">
                  <Mail className="w-5 h-5 text-primary mx-auto" />
                  <p className="text-xs text-muted-foreground">Personalized Emails</p>
                </div>
                <div className="space-y-1">
                  <Sparkles className="w-5 h-5 text-accent mx-auto" />
                  <p className="text-xs text-muted-foreground">Custom Experience</p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <SuccessModal
        isOpen={showSuccess}
        onClose={() => setShowSuccess(false)}
        name={formData.name}
      />
    </>
  );
};