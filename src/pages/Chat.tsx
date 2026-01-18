import { useEffect, useRef, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { ChatHeader } from '@/components/chat/ChatHeader';
import { ChatMessages } from '@/components/chat/ChatMessages';
import { ChatInput } from '@/components/chat/ChatInput';
import { SearchingOverlay } from '@/components/chat/SearchingOverlay';
import { IdleState } from '@/components/chat/IdleState';
import {
  startRandomChat,
  pollMessages,
  sendMessage,
  disconnectChat,
} from '@/lib/api';
import { toast } from 'sonner';

export default function Chat() {
  const navigate = useNavigate();
  const {
    user,
    authToken,
    isAuthenticated,
    chatStatus,
    partnerName,
    partnerIdentifier,
    messageshash,
    notifierHash,
    newMessagesT,
    setChatStatus,
    setPartner,
    addMessages,
    updatePollState,
    resetChat,
  } = useStore();

  const pollIntervalRef = useRef<ReturnType<typeof setInterval>>();
  const [isStarting, setIsStarting] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  // Poll for messages
  const poll = useCallback(async () => {
    if (!user || !authToken || chatStatus !== 'connected') return;

    try {
      const response = await pollMessages(
        authToken,
        user.auth,
        partnerIdentifier || undefined,
        messageshash || undefined,
        notifierHash || undefined,
        newMessagesT || undefined
      );

      // Update poll state
      if (response.messageshash) {
        updatePollState(
          response.messageshash,
          response.notifier_hash,
          response.new_messages_t
        );
      }

      // Add new messages
      if (response.messages && response.messages.length > 0) {
        addMessages(response.messages);
      }

      // Check for partner info
      if (response.notifier_data?.partner && !partnerName) {
        setPartner(response.notifier_data.partner, response.notifier_data.partner);
      }

      // Check if partner disconnected
      if (response.partner_state === 'offline' && partnerName) {
        toast.info('Your chat partner has disconnected');
        setChatStatus('disconnected');
      }
    } catch (error) {
      console.error('Poll error:', error);
    }
  }, [
    user,
    authToken,
    chatStatus,
    partnerIdentifier,
    messageshash,
    notifierHash,
    newMessagesT,
    partnerName,
    addMessages,
    updatePollState,
    setPartner,
    setChatStatus,
  ]);

  // Start polling when connected
  useEffect(() => {
    if (chatStatus === 'connected') {
      poll(); // Initial poll
      pollIntervalRef.current = setInterval(poll, 2000);
    }

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [chatStatus, poll]);

  const handleStartChat = async () => {
    if (!user || !authToken) return;

    setIsStarting(true);
    setChatStatus('searching');

    try {
      const response = await startRandomChat(authToken, user.auth);
      
      if (response.random.status === 'searching' || response.random.status === 'connected') {
        // Start polling to find partner
        const checkForPartner = async () => {
          const pollResponse = await pollMessages(authToken, user.auth);
          
          if (pollResponse.notifier_data?.partner) {
            setPartner(pollResponse.notifier_data.partner, pollResponse.notifier_data.partner);
            toast.success('Connected with a stranger!');
            return true;
          }
          return false;
        };

        // Poll for partner
        let found = await checkForPartner();
        let attempts = 0;
        while (!found && attempts < 30) {
          await new Promise((resolve) => setTimeout(resolve, 2000));
          found = await checkForPartner();
          attempts++;
        }

        if (!found) {
          toast.error('No one available right now. Try again later.');
          setChatStatus('idle');
        }
      }
    } catch (error) {
      console.error('Start chat error:', error);
      toast.error('Failed to start chat. Please try again.');
      setChatStatus('idle');
    } finally {
      setIsStarting(false);
    }
  };

  const handleSendMessage = async (message: string) => {
    if (!user || !authToken || !partnerIdentifier) return;

    try {
      await sendMessage(authToken, user.auth, partnerIdentifier, message);
      
      // Add message optimistically
      addMessages([
        {
          hunter: user.username,
          message,
          time: Math.floor(Date.now() / 1000),
          seen: 0,
          random: 1,
        },
      ]);
    } catch (error) {
      console.error('Send message error:', error);
      toast.error('Failed to send message');
    }
  };

  const handleDisconnect = async () => {
    if (!user || !authToken || !partnerIdentifier) return;

    try {
      await disconnectChat(authToken, user.auth, partnerIdentifier);
      toast.info('Chat ended');
      resetChat();
    } catch (error) {
      console.error('Disconnect error:', error);
      resetChat();
    }
  };

  const handleNextChat = async () => {
    await handleDisconnect();
    setTimeout(() => {
      handleStartChat();
    }, 500);
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      <ChatHeader onDisconnect={handleDisconnect} onNextChat={handleNextChat} />

      <div className="flex-1 flex flex-col relative overflow-hidden">
        <AnimatePresence mode="wait">
          {chatStatus === 'searching' && <SearchingOverlay key="searching" />}
        </AnimatePresence>

        {(chatStatus === 'idle' || chatStatus === 'disconnected') && (
          <IdleState onStartChat={handleStartChat} isLoading={isStarting} />
        )}

        {chatStatus === 'connected' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 flex flex-col overflow-hidden"
          >
            <ChatMessages />
            <ChatInput
              onSend={handleSendMessage}
              disabled={chatStatus !== 'connected'}
            />
          </motion.div>
        )}
      </div>
    </div>
  );
}
