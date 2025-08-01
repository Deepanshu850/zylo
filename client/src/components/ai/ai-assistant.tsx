import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Bot, 
  User, 
  Send, 
  Mic, 
  Upload, 
  Search,
  TrendingUp,
  Calculator,
  Shield,
  Clock,
  MessageCircle,
  Phone
} from "lucide-react";
import { useAiChat } from "@/hooks/use-ai-chat";
import { formatCurrency } from "@/lib/constants";
import { Link } from "wouter";

interface PropertyRecommendation {
  property_id: string;
  relevance_score: number;
  reasoning: string;
  pros: string[];
  cons: string[];
}

export default function AIAssistant() {
  const [inputValue, setInputValue] = useState("");
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  const { messages, sendMessage, isLoading, sessionId } = useAiChat({
    context: {
      language: "English",
      searchFilters: {},
    }
  });

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (inputValue.trim() && !isLoading) {
      sendMessage(inputValue);
      setInputValue("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleQuickAction = (query: string) => {
    if (!isLoading) {
      sendMessage(query);
    }
  };

  const quickActions = [
    {
      icon: Search,
      label: "Property Search",
      query: "Show me 3BHK apartments under ₹2 crores in Bangalore",
      color: "text-primary"
    },
    {
      icon: TrendingUp,
      label: "Market Analysis",
      query: "What are the current market trends in Mumbai real estate?",
      color: "text-success"
    },
    {
      icon: Shield,
      label: "Legal Check",
      query: "Help me understand RERA compliance for a property",
      color: "text-warning"
    },
    {
      icon: Calculator,
      label: "ROI Calculator",
      query: "Calculate ROI for a ₹1.5Cr property in Gurgaon",
      color: "text-purple-600"
    }
  ];

  const formatTimestamp = (date: Date) => {
    return new Intl.DateTimeFormat('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(date);
  };

  const renderPropertyRecommendation = (property: PropertyRecommendation) => (
    <div key={property.property_id} className="bg-white rounded-lg p-3 border border-gray-200 mt-2">
      <div className="flex justify-between items-start mb-2">
        <div>
          <div className="font-medium text-gray-900">Property ID: {property.property_id}</div>
          <div className="text-sm text-gray-600">Relevance: {Math.round(property.relevance_score * 100)}%</div>
        </div>
        <Link href={`/property/${property.property_id}`}>
          <Button variant="outline" size="sm">View Details</Button>
        </Link>
      </div>
      
      <p className="text-sm text-gray-700 mb-2">{property.reasoning}</p>
      
      {property.pros && property.pros.length > 0 && (
        <div className="mb-2">
          <div className="text-xs font-medium text-success mb-1">Pros:</div>
          <ul className="text-xs text-gray-600 space-y-1">
            {property.pros.map((pro, index) => (
              <li key={index} className="flex items-start">
                <span className="text-success mr-1">✓</span>
                <span>{pro}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {property.cons && property.cons.length > 0 && (
        <div>
          <div className="text-xs font-medium text-warning mb-1">Considerations:</div>
          <ul className="text-xs text-gray-600 space-y-1">
            {property.cons.map((con, index) => (
              <li key={index} className="flex items-start">
                <span className="text-warning mr-1">!</span>
                <span>{con}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );

  return (
    <Card className="w-full max-w-4xl mx-auto shadow-2xl">
      {/* Chat Header */}
      <CardHeader className="gradient-primary text-white rounded-t-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 rounded-full p-2">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-white">ZyloAI Assistant</CardTitle>
              <p className="text-blue-100 text-sm">Online • Ready to help</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge className="bg-success text-white">MULTILINGUAL</Badge>
            <Badge className="bg-white/20 text-white">AI-POWERED</Badge>
          </div>
        </div>
      </CardHeader>

      {/* Chat Messages */}
      <CardContent className="p-0">
        <ScrollArea ref={scrollAreaRef} className="h-96 p-6 custom-scrollbar">
          <div className="space-y-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start space-x-3 ${
                  message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                }`}
              >
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  message.type === 'user' 
                    ? 'bg-gray-200' 
                    : 'bg-primary'
                }`}>
                  {message.type === 'user' ? (
                    <User className="h-4 w-4 text-gray-600" />
                  ) : (
                    <Bot className="h-4 w-4 text-white" />
                  )}
                </div>
                
                <div className={`flex-1 ${message.type === 'user' ? 'text-right' : ''}`}>
                  <div
                    className={`inline-block p-4 rounded-2xl max-w-[85%] ${
                      message.type === 'user'
                        ? 'bg-primary text-white ml-auto'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                    
                    {/* Render property recommendations */}
                    {message.properties && message.properties.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {message.properties.map((property) => renderPropertyRecommendation(property))}
                      </div>
                    )}
                    
                    {/* Render follow-up questions */}
                    {message.followUpQuestions && message.followUpQuestions.length > 0 && (
                      <div className="mt-3 space-y-2">
                        <div className="text-xs font-medium text-gray-600 mb-2">Suggested questions:</div>
                        {message.followUpQuestions.map((question, index) => (
                          <Button
                            key={index}
                            variant="outline"
                            size="sm"
                            className="mr-2 mb-2 text-xs"
                            onClick={() => handleQuickAction(question)}
                            disabled={isLoading}
                          >
                            {question}
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className={`text-xs text-gray-500 mt-1 ${
                    message.type === 'user' ? 'text-right' : ''
                  }`}>
                    {formatTimestamp(message.timestamp)}
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex items-start space-x-3">
                <div className="bg-primary rounded-full p-2">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <div className="bg-gray-100 rounded-2xl p-4">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>

      {/* Chat Input */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex space-x-3 mb-3">
          <div className="flex-1 relative">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about real estate..."
              className="pr-12"
              disabled={isLoading}
            />
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 transform -translate-y-1/2"
              onClick={() => setIsVoiceActive(!isVoiceActive)}
              disabled={isLoading}
            >
              <Mic className={`h-4 w-4 ${isVoiceActive ? 'text-primary' : 'text-gray-400'}`} />
            </Button>
          </div>
          <Button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
            className="bg-primary hover:bg-primary-dark"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex space-x-4 text-sm text-gray-500">
            <button className="hover:text-primary transition-colors" disabled={isLoading}>
              हिंदी में बात करें
            </button>
            <button className="hover:text-primary transition-colors" disabled={isLoading}>
              <Upload className="h-3 w-3 inline mr-1" />
              Upload Documents
            </button>
          </div>
          <div className="text-xs text-gray-400">
            Session: {sessionId.slice(-8)} • Powered by ZyloAI
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="border-t border-gray-200 p-4 bg-gray-50 rounded-b-2xl">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {quickActions.map((action, index) => (
            <Button
              key={index}
              variant="outline"
              className="h-auto p-3 flex flex-col items-center space-y-2 hover:bg-white transition-colors"
              onClick={() => handleQuickAction(action.query)}
              disabled={isLoading}
            >
              <action.icon className={`h-5 w-5 ${action.color}`} />
              <span className="text-xs font-medium text-gray-700">{action.label}</span>
            </Button>
          ))}
        </div>
        
        <div className="text-center mt-3">
          <div className="text-xs text-gray-500 flex items-center justify-center space-x-4">
            <span className="flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              Available 24/7
            </span>
            <span className="flex items-center">
              <MessageCircle className="h-3 w-3 mr-1" />
              Multilingual Support
            </span>
            <span className="flex items-center">
              <Phone className="h-3 w-3 mr-1" />
              Human Backup Available
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
