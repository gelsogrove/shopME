import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { getWorkspaceId } from '@/config/workspace.config';
import { api } from '@/services/api';
import axios from 'axios';
import { MessageCircle, Send, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'customer';
  timestamp: Date;
}

// Interface for selected chat from chat history
interface Chat {
  id: string;
  sessionId: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  companyName?: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isActive: boolean;
  isFavorite: boolean;
  messages?: Message[];
}

interface WhatsAppChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  channelName?: string;
  phoneNumber?: string;
  workspaceId?: string;
  selectedChat?: Chat | null;
}

export function WhatsAppChatModal({ 
  isOpen, 
  onClose, 
  channelName = "L'Altra Italia", 
  phoneNumber = "",
  workspaceId = "",
  selectedChat
}: WhatsAppChatModalProps) {
  const [userPhoneNumber, setUserPhoneNumber] = useState(phoneNumber || selectedChat?.customerPhone || "");
  const [chatStarted, setChatStarted] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [initialMessage, setInitialMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
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
        setUserPhoneNumber(phoneNumber || selectedChat?.customerPhone || "");
        setIsLoading(false);
      }, 300);
    } else {
      // If we have a selected chat, start the chat with that data
      if (selectedChat) {
        setUserPhoneNumber(selectedChat.customerPhone);
        setChatStarted(true);
        // Load the messages for this chat
        fetchMessagesForSelectedChat();
      } else {
        // Focus input field when chat opens
        setTimeout(() => {
          if (inputRef.current && chatStarted) {
            inputRef.current.focus();
          }
        }, 100);
      }
    }
  }, [isOpen, phoneNumber, chatStarted, selectedChat]);
  
  // Fetch messages for the selected chat
  const fetchMessagesForSelectedChat = async () => {
    if (!selectedChat) return;
    
    setIsLoading(true);
    try {
      const response = await api.get(`/chat/${selectedChat.sessionId}/messages`);
      
      if (response.data.success) {
        // Transform backend messages to frontend format for the playground
        const chatMessages = response.data.data.map((message: any) => ({
          id: message.id,
          content: message.content,
          // Map MessageDirection.INBOUND to 'customer' and MessageDirection.OUTBOUND to 'user' (like main chat)
          sender: message.direction === 'INBOUND' ? 'customer' : 'user',
          timestamp: new Date(message.createdAt)
        }));
        
        setMessages(chatMessages);
      }
    } catch (error) {
      console.error("Error loading messages for selected chat:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Auto-scroll to the latest message
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

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
  
  // Format WhatsApp message for display - handles asterisks as bold
  const formatWhatsAppMessage = (text: string) => {
    // Replace single asterisks with <strong> tags for bold text
    let formattedText = text.replace(/\*(.*?)\*/g, '<strong>$1</strong>');
    
    // Replace underscores with <em> tags for italic text
    formattedText = formattedText.replace(/_(.*?)_/g, '<em>$1</em>');
    
    // Convert line breaks to <br> tags
    formattedText = formattedText.replace(/\n/g, '<br />');
    
    return formattedText;
  };
  
  const startChat = async () => {
    if (!isValidPhoneNumber(userPhoneNumber)) return;
    if (!initialMessage.trim()) return;
    
    setChatStarted(true);
    
    // Add the initial message
    const userMessage: Message = {
      id: (Date.now() + 100).toString(),
      content: initialMessage,
      sender: 'user',
      timestamp: new Date(),
    };
    
    setMessages([userMessage]);
    setInitialMessage('');
    setIsLoading(true);
    
    try {
      // Call the API to process the initial message
      const apiUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/messages`;
      
      // Use provided workspaceId or get from config
      const currentWorkspaceId = getWorkspaceId(workspaceId);
      
      const response = await axios.post(apiUrl, { 
        message: userMessage.content,
        phoneNumber: userPhoneNumber,
        workspaceId: currentWorkspaceId
      });
      
      if (response.data.success) {
        // Create the bot message from the API response
        const botMessage: Message = {
          id: (Date.now() + 200).toString(),
          content: response.data.data.processedMessage,
          sender: 'customer',
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, botMessage]);
      } else {
        // Handle API error response
        console.error('API Error:', response.data.error);
        
        // Add an error message
        const errorMessage: Message = {
          id: (Date.now() + 200).toString(),
          content: 'Sorry, there was an error processing your message. Please try again later.',
          sender: 'customer',
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error('Error calling message API:', error);
      
      // Add an error message
      const errorMessage: Message = {
        id: (Date.now() + 200).toString(),
        content: 'Sorry, there was an error processing your message. Please try again later.',
        sender: 'customer',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const sendMessage = async () => {
    if (!currentMessage.trim() || isLoading) return;
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: currentMessage,
      sender: 'user',
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setCurrentMessage('');
    setIsLoading(true);
    
    try {
      // Call the API to process the message
      const apiUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/messages`;
      
      // Use provided workspaceId or get from config
      const currentWorkspaceId = getWorkspaceId(workspaceId);
      
      const response = await axios.post(apiUrl, { 
        message: userMessage.content,
        phoneNumber: userPhoneNumber,
        workspaceId: currentWorkspaceId
      });
      
      if (response.data.success) {
        // Create the bot message from the API response
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: response.data.data.processedMessage,
          sender: 'customer',
          timestamp: new Date()
        };
        
        setMessages((prev) => [...prev, botMessage]);
      } else {
        // Handle API error response
        console.error('API Error:', response.data.error);
        
        // Add an error message
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: 'Sorry, there was an error processing your message. Please try again later.',
          sender: 'customer',
          timestamp: new Date()
        };
        
        setMessages((prev) => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error('Error calling message API:', error);
      
      // Add an error message
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Sorry, there was an error processing your message. Please try again later.',
        sender: 'customer',
        timestamp: new Date()
      };
      
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };
  
  // Reset chat to allow new message
  const handleNewMessage = () => {
    setChatStarted(false);
    setMessages([]);
    setCurrentMessage('');
    setInitialMessage('');
    setUserPhoneNumber('');
    // Optionally, clear selectedChat if you want to fully reset
    // if (typeof setSelectedChat === 'function') setSelectedChat(null);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      // Only allow closing via the X button, not by clicking outside
      if (!open && isOpen) {
        // Do nothing, prevent closing
      }
    }}>
      <DialogContent className="sm:max-w-[600px] md:max-w-[700px] p-0 overflow-hidden [&>button]:hidden h-[850px] flex flex-col" aria-describedby="whatsapp-dialog-description">
        <DialogTitle className="sr-only">WhatsApp Chat</DialogTitle>
        <DialogDescription id="whatsapp-dialog-description" className="sr-only">
          WhatsApp conversation interface to chat with a contact
        </DialogDescription>
        {/* WhatsApp header migliorato con icona WhatsApp e X */}
        <div className="bg-gradient-to-r from-green-500 to-green-400 shadow-md p-4 flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-white text-green-600 rounded-full flex items-center justify-center text-xl font-bold shadow mr-4">
              {selectedChat?.customerName ? getInitials(selectedChat.customerName) : "WC"}
            </div>
            <span className="text-white text-lg font-bold flex items-center">
              <MessageCircle className="h-6 w-6 mr-2 text-white opacity-80" />
              {userPhoneNumber || channelName}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-green-600 rounded-full p-2 transition"
            aria-label="Close"
          >
            <X className="h-6 w-6" />
          </button>
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
                disabled={!isValidPhoneNumber(userPhoneNumber) || !initialMessage.trim() || isLoading}
              >
                {isLoading ? 'Processing...' : 'Start Chat'}
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
                    className={`flex ${message.sender === 'customer' ? 'justify-start' : 'justify-end'} mb-3`}
                  >
                    <div
                      className={
                        message.sender === 'customer'
                          ? 'bg-white border border-gray-200 rounded-2xl rounded-br-md shadow-sm px-5 py-3 max-w-[600px] mb-2'
                          : 'bg-green-100 text-green-900 rounded-2xl rounded-bl-md shadow-sm px-5 py-3 max-w-[600px] mb-2'
                      }
                    >
                      <span className="break-words whitespace-pre-line text-sm">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            a: ({node, ...props}) => (
                              <a
                                {...props}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline"
                              />
                            )
                          }}
                        >
                          {message.content}
                        </ReactMarkdown>
                      </span>
                      <div className="text-[10px] text-gray-300 text-right mt-1">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white border border-gray-200 rounded-2xl rounded-br-md shadow-sm px-4 py-2 max-w-[90%]">
                      <div className="flex items-center">
                        <span className="text-xs text-gray-500 mr-2">typing</span>
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms', animationDuration: '0.8s' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms', animationDuration: '0.8s' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms', animationDuration: '0.8s' }}></div>
                        </div>
                      </div>
                      <div className="text-right text-xs text-gray-500 mt-1">
                        {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
            
            {/* Input migliorato */}
            <div className="flex items-center p-3 border-t bg-white">
              <Textarea
                ref={inputRef}
                placeholder={isLoading ? "Please wait..." : "Type a message"}
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                className={`flex-1 rounded-full border border-gray-300 px-4 py-2 mr-2 min-h-[40px] resize-none text-xs ${isLoading ? 'opacity-70' : ''}`}
                rows={2}
                disabled={isLoading}
              />
              <Button
                type="button"
                size="icon"
                onClick={sendMessage}
                disabled={!currentMessage.trim() || isLoading}
                className={`bg-green-500 hover:bg-green-600 text-white rounded-full p-3 shadow transition h-10 w-10 flex items-center justify-center ${isLoading ? 'bg-gray-400' : ''}`}
                aria-label="Send message"
              >
                <Send size={20} />
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
} 