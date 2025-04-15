import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Send } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

interface WhatsAppChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  channelName?: string;
  phoneNumber?: string;
}

export function WhatsAppChatModal({ isOpen, onClose, channelName = "L'Altra Italia", phoneNumber = "" }: WhatsAppChatModalProps) {
  const [userPhoneNumber, setUserPhoneNumber] = useState(phoneNumber);
  const [chatStarted, setChatStarted] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [initialMessage, setInitialMessage] = useState('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  
  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setChatStarted(false);
        setMessages([]);
        setCurrentMessage('');
        setInitialMessage('');
        setUserPhoneNumber(phoneNumber);
      }, 300);
    } else {
      // Focus input field when chat opens
      setTimeout(() => {
        if (inputRef.current && chatStarted) {
          inputRef.current.focus();
        }
      }, 100);
    }
  }, [isOpen, phoneNumber, chatStarted]);
  
  // Auto-scroll to the latest message
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Get initials from channel name
  const getInitials = (name: string) => {
    if (!name) return '';
    const words = name.split(' ');
    if (words.length === 1) return name.substring(0, 2).toUpperCase();
    return (words[0][0] + words[1][0]).toUpperCase();
  };
  
  // Validate phone number - at least 10 digits
  const isValidPhoneNumber = (number: string) => {
    return /^\+?[\d\s]{10,}$/.test(number.trim());
  };
  
  const startChat = () => {
    if (!isValidPhoneNumber(userPhoneNumber)) return;
    if (!initialMessage.trim()) return;
    
    setChatStarted(true);
    
    const messages = [];
    
    // Add the initial message
    const userMessage: Message = {
      id: (Date.now() + 100).toString(),
      content: initialMessage,
      sender: 'user',
      timestamp: new Date(),
    };
    
    messages.push(userMessage);
    
    // Add a response to the initial message
    const botResponse = generateBotResponse(initialMessage);
    messages.push({
      ...botResponse,
      id: (Date.now() + 200).toString(),
    });
    
    setMessages(messages);
  };
  
  const generateBotResponse = (userMessage: string) => {
    const userMessageLower = userMessage.toLowerCase();
    let botResponse = "Thank you for your message. A team member will get back to you shortly.";
    
    if (userMessageLower.includes('hello') || userMessageLower.includes('hi') || userMessageLower.includes('hey')) {
      botResponse = "Hi there! How can I assist you today?";
    } else if (userMessageLower.includes('product') || userMessageLower.includes('products')) {
      botResponse = "We have a great selection of products available. Would you like me to recommend some of our popular items?";
    } else if (userMessageLower.includes('price') || userMessageLower.includes('cost')) {
      botResponse = "Our prices vary depending on the product. Could you tell me which specific item you're interested in?";
    } else if (userMessageLower.includes('shipping') || userMessageLower.includes('delivery')) {
      botResponse = "We offer standard shipping (3-5 business days) and express shipping (1-2 business days). Shipping is free for orders over $50!";
    } else if (userMessageLower.includes('help') || userMessageLower.includes('support')) {
      botResponse = "I'm here to help! Please let me know what you need assistance with.";
    }
    
    return {
      id: Date.now().toString(),
      content: botResponse,
      sender: 'bot',
      timestamp: new Date(),
    } as Message;
  };
  
  const sendMessage = () => {
    if (!currentMessage.trim()) return;
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: currentMessage,
      sender: 'user',
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setCurrentMessage('');
    
    // Simulate bot typing delay
    setTimeout(() => {
      const botMessage = generateBotResponse(userMessage.content);
      setMessages((prev) => [...prev, botMessage]);
    }, 1000);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      // Only allow closing via the X button, not by clicking outside
      if (!open && isOpen) {
        // Do nothing, prevent closing
      }
    }}>
      <DialogContent className="sm:max-w-[600px] md:max-w-[700px] p-0 overflow-hidden [&>button]:hidden h-[700px] flex flex-col" aria-describedby="whatsapp-dialog-description">
        <DialogTitle className="sr-only">WhatsApp Chat</DialogTitle>
        <DialogDescription id="whatsapp-dialog-description" className="sr-only">
          WhatsApp conversation interface to chat with a contact
        </DialogDescription>
        
        {/* WhatsApp header */}
        <div className="bg-green-500 text-white p-4 flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mr-3">
              <span className="text-green-500 font-bold">PG</span>
            </div>
            <div>
              <h3 className="font-bold">{!chatStarted ? "WhatsApp Chat" : userPhoneNumber}</h3>
              {!chatStarted && <p className="text-xs">PLAYGROUND</p>}
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-white hover:bg-green-600 rounded-full" 
            onClick={onClose}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </Button>
        </div>
        
        {!chatStarted ? (
          <div className="p-6 flex-1 overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Enter details to start a chat</h3>
            <div className="space-y-6">
              <div>
                <Label htmlFor="phone-number">Phone Number</Label>
                <Input
                  id="phone-number"
                  type="tel"
                  placeholder="+1 234 567 8900"
                  value={userPhoneNumber}
                  onChange={(e) => setUserPhoneNumber(e.target.value)}
                  autoFocus
                  className="mt-2"
                />
                <p className="text-xs text-gray-500 mt-1">Enter the recipient's phone number including country code</p>
              </div>
              
              <div>
                <Label htmlFor="initial-message">First Message *</Label>
                <Textarea
                  id="initial-message"
                  placeholder="Hello, I'd like to know about your products..."
                  value={initialMessage}
                  onChange={(e) => setInitialMessage(e.target.value)}
                  className="mt-2"
                  rows={3}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Enter the first message to start the conversation</p>
              </div>
              
              <Button 
                className="w-full bg-green-500 hover:bg-green-600" 
                onClick={startChat}
                disabled={!isValidPhoneNumber(userPhoneNumber) || !initialMessage.trim()}
              >
                Start Chat
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* Chat messages */}
            <ScrollArea className="flex-1 p-4 bg-gray-100">
              <div className="space-y-3">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[75%] rounded-lg p-3 ${
                        message.sender === 'user' 
                          ? 'bg-green-100 rounded-tr-none' 
                          : 'bg-white rounded-tl-none'
                      }`}
                    >
                      <div className="text-sm">{message.content}</div>
                      <div className="text-right text-xs text-gray-500 mt-1">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
            
            {/* Message input */}
            <div className="p-3 bg-gray-50 flex items-center space-x-2">
              <Textarea
                ref={inputRef}
                placeholder="Type a message"
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                className="bg-white min-h-[80px]"
                rows={3}
              />
              <Button
                type="button"
                size="icon"
                onClick={sendMessage}
                disabled={!currentMessage.trim()}
                className="bg-green-500 hover:bg-green-600 text-white h-10 w-10 rounded-full p-2 self-end"
              >
                <Send size={18} />
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
} 