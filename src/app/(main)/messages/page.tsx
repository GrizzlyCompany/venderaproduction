
'use client';

import { useState, useEffect } from 'react';
import { ChatWindow } from '@/components/chat/ChatWindow';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Loader2, MessageCircle, MessagesSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useChatStore } from '@/components/chat/use-chat-store';
import Link from 'next/link';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/context/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { es, enUS } from 'date-fns/locale';

export default function MessagesPage() {
  const { user, loading: authLoading } = useAuth();
  const { conversations, selectedConversation, selectConversation, loading: chatLoading } = useChatStore();
  const { t, locale } = useTranslation();
  
  const isLoading = authLoading || chatLoading;
  
  const getTimestamp = (timestamp: string) => {
    if (!timestamp) return "just now";
    try {
        const date = new Date(timestamp);
        return formatDistanceToNow(date, { addSuffix: true, locale: locale === 'es' ? es : enUS });
    } catch(e) {
        return "just now"
    }
  }

  if (isLoading) {
     return (
        <div className="flex justify-center items-center min-h-[calc(100vh-8rem)]">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
        </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="text-center py-24 bg-card rounded-xl border border-dashed flex flex-col items-center container mx-auto mt-8">
        <MessagesSquare className="w-16 h-16 text-muted-foreground/50 mb-4" />
        <h2 className="text-2xl font-semibold mb-2 text-primary">
          {t('messages.empty.title')}
        </h2>
        <p className="text-muted-foreground mb-6">
          {t('messages.empty.description')}
        </p>
         <Link href="/">
            <div className='text-primary hover:underline'>{t('messages.empty.button')}</div>
          </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
       <div className="mb-8">
        <h1 className="font-headline text-4xl font-bold text-primary mb-2">
          {t('messages.title')}
        </h1>
        <p className="text-lg text-muted-foreground">
          {t('messages.subtitle')}
        </p>
      </div>
      <Card className="h-[calc(100vh-18rem)] flex overflow-hidden">
        <div className="w-1/3 border-r overflow-y-auto">
          <div className="p-4 font-semibold border-b">
            {t('messages.allMessages')} ({conversations.length})
          </div>
          <nav className="p-2 space-y-1">
            {conversations.map((convo) => (
              <button
                key={convo.id}
                onClick={() => selectConversation(convo.id)}
                className={cn(
                  "w-full text-left p-3 rounded-lg flex items-start gap-3 transition-colors",
                  selectedConversation?.id === convo.id ? "bg-muted" : "hover:bg-muted/50"
                )}
              >
                <Link href={`/profile/${convo.otherUser.id}`} onClick={(e) => e.stopPropagation()}>
                    <Avatar className="h-10 w-10 hover:ring-2 hover:ring-primary transition-all">
                      <AvatarImage src={convo.otherUser.avatar_url || undefined} />
                      <AvatarFallback>{convo.otherUser.full_name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                </Link>
                <div className="flex-grow overflow-hidden">
                   <div className="flex justify-between items-center">
                    <Link href={`/profile/${convo.otherUser.id}`} onClick={(e) => e.stopPropagation()}>
                        <p className="font-semibold text-sm truncate hover:underline">{convo.otherUser.full_name}</p>
                    </Link>
                     <p className="text-xs text-muted-foreground flex-shrink-0">{getTimestamp(convo.created_at)}</p>
                   </div>
                   <p className="text-sm text-muted-foreground truncate">{ convo.lastMessage }</p>
                </div>
                 {!convo.last_message_read && convo.last_message_sender_id !== user?.id && <div className="w-2 h-2 rounded-full bg-primary mt-1 flex-shrink-0"></div>}
              </button>
            ))}
          </nav>
        </div>
        <div className="w-2/3 flex flex-col">
          {selectedConversation ? (
            <ChatWindow
              key={selectedConversation.id}
              conversationId={selectedConversation.id}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                <MessageCircle className="h-16 w-16 mb-4" />
                <h2 className="text-xl font-semibold">{t('messages.select.title')}</h2>
                <p>{t('messages.select.description')}</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
