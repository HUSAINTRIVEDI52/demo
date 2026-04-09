import { useState, useEffect } from 'react';
import { useWorkspace } from '@/hooks/useWorkspace';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Mail, MailOpen, Inbox as InboxIcon, Clock, User, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import { ListSkeleton } from '@/components/ui/premium-skeleton';
import { EmptyState } from '@/components/ui/empty-state';

interface ContactMessage {
  id: string;
  portfolio_id: string;
  sender_name: string;
  sender_email: string;
  subject: string | null;
  message: string;
  read: boolean;
  created_at: string;
}

export default function Inbox() {
  const { portfolio, loading: workspaceLoading } = useWorkspace();
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);

  useEffect(() => {
    if (portfolio?.id) {
      fetchMessages();
    }
  }, [portfolio?.id]);

  const fetchMessages = async () => {
    if (!portfolio?.id) return;

    try {
      const { data, error } = await supabase
        .from('contact_messages')
        .select('id, portfolio_id, sender_name, sender_email, subject, message, read, created_at')
        .eq('portfolio_id', portfolio.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (messageId: string) => {
    if (!portfolio?.id) return;

    try {
      await supabase
        .from('contact_messages')
        .update({ read: true })
        .eq('id', messageId)
        .eq('portfolio_id', portfolio.id);

      setMessages((prev) =>
        prev.map((m) => (m.id === messageId ? { ...m, read: true } : m))
      );
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  const handleOpenMessage = (message: ContactMessage) => {
    setSelectedMessage(message);
    if (!message.read) {
      markAsRead(message.id);
    }
  };

  const unreadCount = messages.filter((m) => !m.read).length;

  if (loading || workspaceLoading) {
    return <ListSkeleton count={4} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold mb-2">Inbox</h1>
          <p className="text-muted-foreground">
            Messages from your portfolio visitors
            {unreadCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {unreadCount} unread
              </Badge>
            )}
          </p>
        </div>
      </div>

      {messages.length === 0 ? (
        <EmptyState
          icon={InboxIcon}
          headline="No messages yet"
          description="When visitors contact you through your portfolio, their messages will appear here."
          actionLabel={!portfolio?.published ? "Publish Your Portfolio" : undefined}
          actionHref={!portfolio?.published ? "/app/settings" : undefined}
        />
      ) : (
        <div className="space-y-2">
          {messages.map((message) => (
            <Card
              key={message.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                !message.read ? 'border-l-4 border-l-accent bg-accent/5' : ''
              }`}
              onClick={() => handleOpenMessage(message)}
            >
              <CardContent className="py-4">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1">
                    {message.read ? (
                      <MailOpen className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <Mail className="h-5 w-5 text-accent" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2">
                        <span className={`font-medium truncate ${!message.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                          {message.sender_name}
                        </span>
                        <span className="text-sm text-muted-foreground truncate">
                          &lt;{message.sender_email}&gt;
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground flex-shrink-0">
                        {format(new Date(message.created_at), 'MMM d, h:mm a')}
                      </span>
                    </div>
                    {message.subject && (
                      <p className={`text-sm truncate mb-1 ${!message.read ? 'font-medium' : ''}`}>
                        {message.subject}
                      </p>
                    )}
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {message.message}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Message Detail Dialog */}
      <Dialog open={!!selectedMessage} onOpenChange={() => setSelectedMessage(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Message Details
            </DialogTitle>
          </DialogHeader>
          {selectedMessage && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <div className="h-10 w-10 rounded-full bg-accent/20 flex items-center justify-center">
                  <User className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="font-medium">{selectedMessage.sender_name}</p>
                  <p className="text-sm text-muted-foreground">{selectedMessage.sender_email}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                {format(new Date(selectedMessage.created_at), 'MMMM d, yyyy \'at\' h:mm a')}
              </div>

              {selectedMessage.subject && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Subject</p>
                  <p className="font-medium">{selectedMessage.subject}</p>
                </div>
              )}

              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Message</p>
                <div className="p-4 bg-muted/50 rounded-lg whitespace-pre-wrap text-sm">
                  {selectedMessage.message}
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => setSelectedMessage(null)}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Inbox
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
