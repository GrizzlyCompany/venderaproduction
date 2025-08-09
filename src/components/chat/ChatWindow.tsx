
'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import type { Message, UserProfile } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { useChatStore } from './use-chat-store';

interface ChatWindowProps {
  conversationId: string;
}

export function ChatWindow({ conversationId }: ChatWindowProps) {
  const { user: authUser, supabase } = useAuth();
  const { selectedConversation, updateConversation } = useChatStore();

  const [messages, setMessages] = useState<Message[]>([]);
  const { t } = useTranslation();
  const { toast } = useToast();
  
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const recipient = selectedConversation?.otherUser;

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
       if (scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
        if (viewport) {
          viewport.scrollTop = viewport.scrollHeight;
        }
      }
    }, 100);
  }, []);
  
  useEffect(() => {
    const fetchMessages = async () => {
        if (!conversationId || !supabase) return;
        setIsLoading(true);

        const { data, error } = await supabase
            .from('messages')
            .select('*')
            .eq('conversation_id', conversationId)
            .order('created_at', { ascending: true });

        if (error) {
            console.error("Error fetching messages:", error);
            setMessages([]);
        } else {
            setMessages(data as Message[]);
        }
        setIsLoading(false);
    }
    fetchMessages();
  }, [conversationId, supabase]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);
  
  useEffect(() => {
      if (!supabase || !conversationId) return;

      const channel = supabase.channel(`chat:${conversationId}`)
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${conversationId}` }, 
        (payload) => {
            const newMessage = payload.new as Message;
            setMessages(currentMessages => [...currentMessages, newMessage]);
            
            // Update the last message in the conversation store
            updateConversation(conversationId, {
              lastMessage: newMessage.content
            });
        })
        .subscribe();
      
      return () => {
        supabase.removeChannel(channel);
      }

  }, [supabase, conversationId, authUser?.id]);


  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !authUser || !supabase || !selectedConversation) return;

    setIsSending(true);

    const textToSend = newMessage;
    setNewMessage(''); // Clear input immediately for better UX

    const { error } = await supabase
      .from('messages')
      .insert({
        conversation_id: selectedConversation.id,
        sender_id: authUser.id,
        content: textToSend,
      });

    if (error) {
        console.error("Error sending message:", error);
        toast({ title: "Error", description: "Could not send message.", variant: "destructive" });
        setNewMessage(textToSend); // Restore message on error
    } else {
        // Update the last message in the conversation store
        updateConversation(selectedConversation.id, {
          lastMessage: textToSend
        });
    }
    
    setIsSending(false);
  };
  
  const getAvatar = (senderId: string) => {
    if (senderId === authUser?.id) {
      return authUser?.profile?.avatar_url || authUser?.user_metadata?.avatar_url;
    }
    return recipient?.avatar_url;
  };

  const getInitial = (senderId: string) => {
    if (senderId === authUser?.id) {
      const name = authUser?.profile?.full_name || authUser?.user_metadata?.full_name;
      return name ? name.charAt(0).toUpperCase() : 'U';
    }
    const name = recipient?.full_name;
    return name ? name.charAt(0).toUpperCase() : 'U';
  }

  if (isLoading) {
    return (
        <div className="flex justify-center items-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    );
  }

  if (!recipient) {
     return (
        <div className="flex justify-center items-center h-full">
            <p>Error: No recipient found for this conversation.</p>
        </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-grow p-4 pr-2" ref={scrollAreaRef}>
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                'flex items-end gap-2',
                message.sender_id === authUser?.id ? 'justify-end' : 'justify-start'
              )}
            >
              {message.sender_id !== authUser?.id && (
                <Avatar className="h-8 w-8">
                  <AvatarImage 
                    src={getAvatar(message.sender_id) || undefined}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                  <AvatarFallback>{getInitial(message.sender_id)}</AvatarFallback>
                </Avatar>
              )}
              <div
                className={cn(
                  'max-w-xs rounded-lg p-3 text-sm',
                  message.sender_id === authUser?.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                )}
              >
                <p>{message.content}</p>
                <p className="text-xs opacity-70 mt-1 text-right">{format(new Date(message.created_at), 'p')}</p>
              </div>
              {message.sender_id === authUser?.id && (
                <Avatar className="h-8 w-8">
                  <AvatarImage 
                    src={getAvatar(message.sender_id) || undefined}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                  <AvatarFallback>{getInitial(message.sender_id)}</AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
          {isSending && (
             <div className="flex items-end gap-2 justify-end">
                 <div className="bg-primary rounded-lg p-3 flex items-center">
                    <Loader2 className="h-5 w-5 animate-spin text-primary-foreground" />
                 </div>
                <Avatar className="h-8 w-8">
                  <AvatarImage 
                    src={getAvatar(authUser?.id || '') || undefined}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                  <AvatarFallback>{getInitial(authUser?.id || '')}</AvatarFallback>
                </Avatar>
             </div>
          )}
        </div>
      </ScrollArea>
      <form
        onSubmit={handleSendMessage}
        className="flex items-center gap-2 border-t p-4"
      >
        <Input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder={t('chat.placeholder')}
          autoComplete="off"
          disabled={isSending}
        />
        <Button type="submit" size="icon" disabled={isSending || !newMessage.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}

// Dummy toast for now
const toast = (props: any) => console.log('Toast:', props.title);
