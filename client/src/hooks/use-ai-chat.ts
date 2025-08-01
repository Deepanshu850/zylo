import { useState, useCallback } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { AiQuery } from "@shared/schema";
import { generateSessionId } from "@/lib/constants";

interface ChatMessage {
  id: string;
  type: "user" | "assistant";
  content: string;
  timestamp: Date;
  properties?: any[];
  followUpQuestions?: string[];
}

interface UseChatOptions {
  sessionId?: string;
  context?: AiQuery['context'];
}

export function useAiChat(options?: UseChatOptions) {
  const [sessionId] = useState(() => options?.sessionId || generateSessionId());
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      type: "assistant",
      content: "Hello! I'm ZyloAI, your property advisor. I can help you with property search, market analysis, investment advice, and more. What would you like to know about real estate today?",
      timestamp: new Date(),
      followUpQuestions: [
        "Show me 3BHK apartments under ₹2 crores in Bangalore",
        "What are the trending localities in Mumbai?",
        "Help me compare two properties",
        "What's the market outlook for Gurgaon?"
      ]
    }
  ]);

  const chatMutation = useMutation({
    mutationFn: async (query: string) => {
      const payload: AiQuery = {
        query,
        sessionId,
        context: options?.context
      };
      
      const response = await apiRequest("POST", "/api/ai/chat", payload);
      return response.json();
    },
    onSuccess: (data, query) => {
      // Add user message
      const userMessage: ChatMessage = {
        id: `user_${Date.now()}`,
        type: "user",
        content: query,
        timestamp: new Date()
      };

      // Add AI response
      const aiMessage: ChatMessage = {
        id: `ai_${Date.now()}`,
        type: "assistant",
        content: data.response,
        timestamp: new Date(),
        properties: data.properties,
        followUpQuestions: data.follow_up_questions
      };

      setMessages(prev => [...prev, userMessage, aiMessage]);
    },
    onError: (error) => {
      console.error("Chat error:", error);
      
      const errorMessage: ChatMessage = {
        id: `error_${Date.now()}`,
        type: "assistant",
        content: "I'm sorry, I encountered an error. Please try again or contact support if the issue persists.",
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    }
  });

  const compareMutation = useMutation({
    mutationFn: async (data: { propertyIds: string[]; userPreferences?: any }) => {
      const response = await apiRequest("POST", "/api/ai/compare", data);
      return response.json();
    }
  });

  const sendMessage = useCallback((query: string) => {
    if (query.trim()) {
      chatMutation.mutate(query);
    }
  }, [chatMutation]);

  const compareProperties = useCallback((propertyIds: string[], userPreferences?: any) => {
    compareMutation.mutate({ propertyIds, userPreferences });
  }, [compareMutation]);

  const clearChat = useCallback(() => {
    setMessages([messages[0]]); // Keep welcome message
  }, [messages]);

  // Load chat history
  const { data: chatHistory } = useQuery({
    queryKey: ['/api/ai/chat-history', sessionId],
    enabled: !!sessionId,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  return {
    messages,
    sendMessage,
    compareProperties,
    clearChat,
    isLoading: chatMutation.isPending,
    isComparing: compareMutation.isPending,
    comparisonResult: compareMutation.data,
    sessionId,
    chatHistory: chatHistory?.history || []
  };
}

export function useMarketInsights() {
  const mutation = useMutation({
    mutationFn: async (data: { location: string; timeframe?: string }) => {
      const response = await apiRequest("POST", "/api/market/insights", data);
      return response.json();
    }
  });

  const generateInsights = useCallback((location: string, timeframe = "6months") => {
    mutation.mutate({ location, timeframe });
  }, [mutation]);

  return {
    generateInsights,
    insights: mutation.data,
    isLoading: mutation.isPending,
    error: mutation.error
  };
}
