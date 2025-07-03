import { NewsletterForm } from "@/components/NewsletterForm";
import { Brain, Sparkles, Zap } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-bg">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center space-y-8 mb-16">
          <div className="space-y-4">
            <div className="flex justify-center">
              <div className="p-4 bg-primary/10 rounded-full animate-float">
                <Brain className="w-16 h-16 text-primary" />
              </div>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-primary bg-clip-text text-transparent animate-fade-in-up">
              AI-Powered
              <br />
              Newsletter
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto animate-fade-in">
              Experience the future of personalized communication. Our AI analyzes your interests 
              and crafts the perfect welcome experience just for you.
            </p>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center space-y-3 group">
              <div className="p-3 bg-accent/10 rounded-full w-fit mx-auto group-hover:scale-110 transition-transform duration-300">
                <Sparkles className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-lg font-semibold">Sentiment Analysis</h3>
              <p className="text-sm text-muted-foreground">
                Advanced AI understands the emotion and intent behind your subscription reason
              </p>
            </div>
            
            <div className="text-center space-y-3 group">
              <div className="p-3 bg-primary/10 rounded-full w-fit mx-auto group-hover:scale-110 transition-transform duration-300">
                <Brain className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold">Smart Personalization</h3>
              <p className="text-sm text-muted-foreground">
                Receive content and experiences tailored to your unique interests and preferences
              </p>
            </div>
            
            <div className="text-center space-y-3 group">
              <div className="p-3 bg-accent/10 rounded-full w-fit mx-auto group-hover:scale-110 transition-transform duration-300">
                <Zap className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-lg font-semibold">Instant Welcome</h3>
              <p className="text-sm text-muted-foreground">
                Get a custom welcome email within seconds, perfectly matched to your sentiment
              </p>
            </div>
          </div>
        </div>

        {/* Newsletter Form */}
        <div className="max-w-2xl mx-auto">
          <NewsletterForm />
        </div>

        {/* Footer */}
        <div className="text-center mt-16 pt-8 border-t border-border/20">
          <p className="text-sm text-muted-foreground">
            Powered by advanced AI sentiment analysis • Built with ❤️ for personalized experiences
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
