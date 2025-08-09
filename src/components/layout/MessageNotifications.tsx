
'use client';

import Link from 'next/link';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Bell, Loader2, MessageSquare } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { useChatStore } from '../chat/use-chat-store';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/context/AuthContext';

export function MessageNotifications() {
  const router = useRouter();
  const { user } = useAuth();
  const { conversations, selectConversation, loading } = useChatStore();
  const unreadCount = conversations.filter(c => !c.last_message_read && c.last_message_sender_id !== user?.id).length;
  const { t } = useTranslation();

  const handleNotificationClick = (conversationId: string) => {
    selectConversation(conversationId);
    router.push('/messages');
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          {loading ? (
             <Loader2 className="h-[1.2rem] w-[1.2rem] animate-spin" />
          ) : (
             <Bell className="h-[1.2rem] w-[1.2rem]" />
          )}
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
            </span>
          )}
          <span className="sr-only">{t('notifications.open')}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-4 font-medium border-b">
          <h3>{t('notifications.inbox')}</h3>
        </div>
        <div className="space-y-1 p-2 max-h-[400px] overflow-y-auto">
          {loading ? (
             <div className="flex justify-center items-center p-8">
                <Loader2 className="animate-spin text-muted-foreground" />
             </div>
          ) : conversations.length > 0 ? (
            conversations.slice(0, 5).map((convo) => (
              <div
                key={convo.id}
                className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted cursor-pointer"
                onClick={() => handleNotificationClick(convo.id)}
              >
                <Link
                  href={`/profile/${convo.otherUser.id}`}
                  onClick={(e) => e.stopPropagation()}
                >
                  <Avatar className="hover:ring-2 hover:ring-primary transition-all">
                    <AvatarImage 
                      src={convo.otherUser.avatar_url || undefined}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                    <AvatarFallback>
                      {convo.otherUser.full_name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                </Link>
                <div className="flex-grow overflow-hidden">
                  <div className="flex justify-between items-center">
                    <Link
                      href={`/profile/${convo.otherUser.id}`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <p className="font-semibold text-sm hover:underline">
                        {convo.otherUser.full_name}
                      </p>
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      {new Date(convo.created_at).toLocaleTimeString()}
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {convo.lastMessage}
                  </p>
                </div>
                {!convo.last_message_read && convo.last_message_sender_id !== user?.id && (
                  <div className="w-2 h-2 rounded-full bg-primary mt-1"></div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center text-muted-foreground p-8">
              <MessageSquare className="mx-auto h-8 w-8 mb-2" />
              <p>{t('notifications.noMessages')}</p>
            </div>
          )}
        </div>
        <div className="p-2 border-t text-center">
          <Button variant="link" asChild>
            <Link href="/messages">{t('notifications.viewAll')}</Link>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
