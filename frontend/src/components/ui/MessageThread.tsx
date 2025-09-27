import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Send, User, Clock, Check, CheckCheck, Trash2 } from 'lucide-react';
import { MessageService } from '../../services/messageService';
import type { Message } from '../../services/messageService';
import { useAuthStore } from '../../store/authStore';
import { toast } from 'react-hot-toast';

interface MessageThreadProps {
  applicationId: string;
  className?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export const MessageThread: React.FC<MessageThreadProps> = ({
  applicationId,
  className = "",
  autoRefresh = true,
  refreshInterval = 10000 // 10 seconds
}) => {
  const { user } = useAuthStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadMessages();

    if (autoRefresh) {
      intervalRef.current = setInterval(loadMessages, refreshInterval);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [loadMessages, autoRefresh, refreshInterval]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadMessages = useCallback(async () => {
    try {
      const response = await MessageService.getApplicationMessages(applicationId);
      if (response.success) {
        setMessages(response.data);
        // Mark all messages as read
        await MessageService.markAllMessagesAsRead(applicationId);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des messages:', error);
    } finally {
      setLoading(false);
    }
  }, [applicationId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMessage.trim() || sending) return;

    try {
      setSending(true);
      const response = await MessageService.sendMessage(applicationId, newMessage.trim());

      if (response.success) {
        setMessages(prev => [...prev, response.data]);
        setNewMessage('');
        scrollToBottom();
      } else {
        toast.error('Erreur lors de l\'envoi du message');
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
      toast.error('Erreur lors de l\'envoi du message');
    } finally {
      setSending(false);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce message ?')) return;

    try {
      const response = await MessageService.deleteMessage(messageId);
      if (response.success) {
        setMessages(prev => prev.filter(msg => msg.id !== messageId));
        toast.success('Message supprimé');
      } else {
        toast.error('Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return date.toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } else if (days === 1) {
      return 'Hier à ' + date.toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } else {
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  const isMyMessage = (message: Message) => {
    return message.senderId === user?.id;
  };

  const getSenderLabel = (message: Message) => {
    if (isMyMessage(message)) return 'Vous';

    switch (message.sender.role) {
      case 'COMPANY':
        return 'Entreprise';
      case 'ORGANIZATION':
        return 'Organisation';
      case 'ADMIN':
        return 'Administrateur';
      default:
        return message.sender.email;
    }
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg border p-6 ${className}`}>
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex space-x-3">
              <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg border flex flex-col ${className}`}>
      {/* Header */}
      <div className="p-4 border-b">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <User className="h-5 w-5 mr-2" />
          Messages ({messages.length})
        </h3>
      </div>

      {/* Messages Container */}
      <div className="flex-1 p-4 space-y-4 max-h-96 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Aucun message pour le moment</p>
            <p className="text-sm text-gray-400 mt-1">
              Commencez la conversation en envoyant un message
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${isMyMessage(message) ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`
                  max-w-xs lg:max-w-md px-4 py-2 rounded-lg
                  ${isMyMessage(message)
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                  }
                `}
              >
                {/* Sender Info */}
                <div className={`flex items-center justify-between mb-1 text-xs ${
                  isMyMessage(message) ? 'text-blue-100' : 'text-gray-500'
                }`}>
                  <span className="font-medium">
                    {getSenderLabel(message)}
                  </span>
                  <div className="flex items-center space-x-1">
                    <Clock className="h-3 w-3" />
                    <span>{formatMessageTime(message.createdAt)}</span>
                  </div>
                </div>

                {/* Message Content */}
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>

                {/* Message Status */}
                <div className={`flex items-center justify-between mt-1 ${
                  isMyMessage(message) ? 'text-blue-100' : 'text-gray-400'
                }`}>
                  <div className="flex items-center space-x-1">
                    {isMyMessage(message) && (
                      <>
                        {message.readAt ? (
                          <CheckCheck className="h-3 w-3" />
                        ) : (
                          <Check className="h-3 w-3" />
                        )}
                        <span className="text-xs">
                          {message.readAt ? 'Lu' : 'Envoyé'}
                        </span>
                      </>
                    )}
                  </div>

                  {/* Delete Button */}
                  {isMyMessage(message) && (
                    <button
                      onClick={() => handleDeleteMessage(message.id)}
                      className="ml-2 p-1 hover:bg-blue-700 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Supprimer le message"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t">
        <form onSubmit={handleSendMessage} className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Tapez votre message..."
            disabled={sending}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            <Send className="h-4 w-4" />
            <span className="hidden sm:inline">
              {sending ? 'Envoi...' : 'Envoyer'}
            </span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default MessageThread;