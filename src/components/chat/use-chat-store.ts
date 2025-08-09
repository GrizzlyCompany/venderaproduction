
import { create } from 'zustand';
import type { Conversation, ConversationFromDB, UserProfile } from '@/types';
import { type SupabaseClient, type User } from '@supabase/supabase-js';

interface ChatState {
  conversations: Conversation[];
  selectedConversation: Conversation | null;
  loading: boolean;
  isFetching: boolean;
  setLoading: (loading: boolean) => void;
  selectConversation: (conversationId: string | null) => void;
  setConversations: (conversations: Conversation[]) => void;
  updateConversation: (conversationId: string, updatedData: Partial<Conversation>) => void;
  fetchConversations: (userId: string, supabase: SupabaseClient) => Promise<void>;
  handleStartConversation: (
    otherUser: Pick<UserProfile, 'id' | 'full_name' | 'avatar_url' | 'username'>,
    authUser: User & { profile?: UserProfile },
    supabase: SupabaseClient
  ) => Promise<string | null>;
}

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: [],
  selectedConversation: null,
  loading: true,
  isFetching: false,
  setLoading: (loading) => set({ loading }),
  setConversations: (conversations) => {
    const currentSelected = get().selectedConversation;
    set({ 
      conversations, 
      selectedConversation: currentSelected 
        ? conversations.find(c => c.id === currentSelected.id) || null 
        : null, 
      loading: false 
    });
  },
  selectConversation: (conversationId) => {
    if (!conversationId) {
      set({ selectedConversation: null });
      return;
    }
    const conversation = get().conversations.find((c) => c.id === conversationId);
    
    set({ selectedConversation: conversation || null });
    // Note: Read status should be updated in the backend when messages are fetched/viewed.
  },
  updateConversation: (conversationId, updatedData) => {
    set((state) => {
      const updatedConversations = state.conversations.map((c) =>
        c.id === conversationId ? { ...c, ...updatedData } : c
      );
      
      // Sort conversations by lastMessageAt (most recent first)
      const sortedConversations = updatedConversations.sort((a, b) => 
        new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
      );
      
      const updatedSelectedConversation = state.selectedConversation?.id === conversationId
        ? { ...state.selectedConversation, ...updatedData }
        : state.selectedConversation;
      
      return {
        conversations: sortedConversations,
        selectedConversation: updatedSelectedConversation,
      };
    });
  },
  fetchConversations: async (userId, supabase) => {
    if (!userId || !supabase) return;
    
    // Prevent concurrent fetches
    if (get().isFetching) return;
    
    set({ loading: true, isFetching: true });

    try {
      const { data: convos, error: convosError } = await supabase
        .from('conversations')
        .select('*, buyer:profiles!buyer_id(*), seller:profiles!seller_id(*)')
        .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`);

      if (convosError) {
        console.error("Error fetching conversations:", convosError);
        set({ conversations: [], loading: false, isFetching: false });
        return;
      }

      if (convos) {
        // Fetch last message for each conversation
        const transformedConversations = await Promise.all(
          (convos as unknown as ConversationFromDB[]).map(async (c) => {
            const otherUser = c.buyer_id === userId ? c.seller! : c.buyer!;
            
            // Get the last message for this conversation
            const { data: lastMessageData } = await supabase
              .from('messages')
              .select('content, created_at, sender_id')
              .eq('conversation_id', c.id)
              .order('created_at', { ascending: false })
              .limit(1)
              .single();
            
            const lastMessage = lastMessageData?.content || "No messages yet.";
            const lastMessageAt = lastMessageData?.created_at || c.created_at;
            
            return {
              ...c,
              lastMessage,
              lastMessageAt,
              otherUser,
            } as Conversation;
          })
        );
        
        // Sort conversations by lastMessageAt (most recent first)
        const sortedConversations = transformedConversations.sort((a, b) => 
          new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
        );
        
        set({ conversations: sortedConversations, loading: false, isFetching: false });
      } else {
        set({ conversations: [], loading: false, isFetching: false });
      }
    } catch (error) {
      console.error("Unexpected error fetching conversations:", error);
      set({ conversations: [], loading: false, isFetching: false });
    }
  },
  handleStartConversation: async (otherUser, authUser, supabase) => {
    if (!authUser || authUser.id === otherUser.id) {
      console.log("Cannot start conversation with yourself.");
      return null;
    }
    
    // Subscription check before starting conversation
    if (authUser.profile?.subscription_status !== 'active') {
      console.log("User does not have an active subscription.");
      // The UI should prevent this, but this is a safeguard.
      return null;
    }

    // Check if a conversation already exists between the two users
    const { data: existing, error: existingError } = await supabase
      .from('conversations')
      .select('id')
      .or(`and(buyer_id.eq.${authUser.id},seller_id.eq.${otherUser.id}),and(buyer_id.eq.${otherUser.id},seller_id.eq.${authUser.id})`)
      .maybeSingle();

    if (existingError) {
        console.error("Error checking for existing conversation", existingError);
        return null;
    }

    if (existing) {
      get().selectConversation(existing.id);
      return existing.id;
    }

    // If no existing conversation, create a new one. Auth user is the buyer by default.
    const { data: newConversationData, error } = await supabase
      .from('conversations')
      .insert({
        buyer_id: authUser.id,
        seller_id: otherUser.id,
      })
      .select(`
        *,
        buyer:profiles!buyer_id(*),
        seller:profiles!seller_id(*)
      `)
      .single();

    if (error) {
      console.error('Error creating conversation:', error);
      return null;
    }
    
    const newConvo: Conversation = {
      ...(newConversationData as ConversationFromDB),
      otherUser: newConversationData.seller!, // Since authUser is always the buyer in this function
      lastMessage: "No messages yet.",
      lastMessageAt: newConversationData.created_at,
    };

    set(state => ({
        conversations: [newConvo, ...state.conversations],
        selectedConversation: newConvo
    }));

    return newConvo.id;
  },
}));
