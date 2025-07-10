
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Book, Search, Heart, Share2, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface KnowledgeItem {
  id: string;
  title: string;
  content: string;
  arabic_text?: string;
  translation?: string;
  reference?: string;
  category?: string;
  type: string;
  tags?: string[];
}

const IslamicKnowledge = () => {
  const { toast } = useToast();
  const [knowledge, setKnowledge] = useState<KnowledgeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { value: 'all', label: 'All' },
    { value: 'quran', label: 'Quran' },
    { value: 'hadith', label: 'Hadith' },
    { value: 'dua', label: 'Duas' },
    { value: 'fiqh', label: 'Fiqh' },
    { value: 'seerah', label: 'Seerah' }
  ];

  useEffect(() => {
    fetchKnowledge();
  }, [selectedCategory]);

  const fetchKnowledge = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('islamic_knowledge')
        .select('*')
        .eq('verified', true);

      if (selectedCategory !== 'all') {
        query = query.eq('category', selectedCategory);
      }

      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,content.ilike.%${searchTerm}%,tags.cs.{${searchTerm}}`);
      }

      const { data, error } = await query.limit(20);

      if (error) throw error;
      setKnowledge(data || []);
    } catch (error: any) {
      console.error('Error fetching knowledge:', error);
      toast({
        title: "Error",
        description: "Failed to load Islamic knowledge",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchKnowledge();
  };

  const shareKnowledge = (item: KnowledgeItem) => {
    if (navigator.share) {
      navigator.share({
        title: item.title,
        text: `${item.content}\n\n${item.reference || ''}`,
      });
    } else {
      navigator.clipboard.writeText(`${item.title}\n\n${item.content}\n\n${item.reference || ''}`);
      toast({
        title: "Copied to clipboard",
        description: "Knowledge shared successfully",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Search and Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gradient-primary">
            <Book className="w-5 h-5" />
            Islamic Knowledge
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Search Quran, Hadith, or Islamic topics..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1"
            />
            <Button onClick={handleSearch} size="icon">
              <Search className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category.value}
                variant={selectedCategory === category.value ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.value)}
                className={selectedCategory === category.value ? "bg-gradient-primary" : ""}
              >
                {category.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Knowledge Items */}
      <ScrollArea className="h-[600px]">
        <div className="space-y-4">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 bg-muted rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-3 bg-muted rounded"></div>
                      <div className="h-3 bg-muted rounded w-3/4"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : knowledge.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Book className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No knowledge found. Try different search terms.</p>
              </CardContent>
            </Card>
          ) : (
            knowledge.map((item) => (
              <Card key={item.id} className="shadow-islamic">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg text-foreground mb-2">{item.title}</CardTitle>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary">{item.type}</Badge>
                        {item.category && (
                          <Badge variant="outline">{item.category}</Badge>
                        )}
                        {item.tags?.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => shareKnowledge(item)}>
                        <Share2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {item.arabic_text && (
                    <div className="p-4 bg-gradient-primary/5 rounded-lg border border-primary/10">
                      <p className="text-right text-lg leading-relaxed font-arabic" dir="rtl">
                        {item.arabic_text}
                      </p>
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <p className="text-foreground leading-relaxed">{item.content}</p>
                    
                    {item.translation && item.translation !== item.content && (
                      <div className="pl-4 border-l-2 border-primary/20">
                        <p className="text-muted-foreground italic">{item.translation}</p>
                      </div>
                    )}
                  </div>
                  
                  {item.reference && (
                    <div className="pt-2 border-t">
                      <p className="text-sm text-muted-foreground font-medium">
                        Reference: {item.reference}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </ScrollArea>

      <div className="flex justify-center">
        <Button variant="outline" onClick={fetchKnowledge} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh Knowledge
        </Button>
      </div>
    </div>
  );
};

export default IslamicKnowledge;
