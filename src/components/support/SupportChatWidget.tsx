import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  MessageCircle, 
  X, 
  Mail, 
  HelpCircle, 
  ChevronDown,
  Send
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const SupportChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const navigate = useNavigate();

  // Check if user previously hid the widget
  useEffect(() => {
    const hidden = localStorage.getItem('support_widget_hidden');
    if (hidden === 'true') {
      setIsHidden(true);
    }
  }, []);

  // Auto-hide after 10 seconds of inactivity if not opened
  useEffect(() => {
    if (!isOpen && !isMinimized && !isHidden) {
      const timer = setTimeout(() => {
        setIsMinimized(true);
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, isMinimized, isHidden]);

  const handleHide = () => {
    setIsHidden(true);
    setIsOpen(false);
    localStorage.setItem('support_widget_hidden', 'true');
  };

  const handleShow = () => {
    setIsHidden(false);
    setIsMinimized(false);
    localStorage.removeItem('support_widget_hidden');
  };

  if (isHidden) {
    return (
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="fixed bottom-24 right-4 z-50 lg:bottom-6 p-2 rounded-full bg-muted/80 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors text-xs"
        onClick={handleShow}
      >
        <HelpCircle className="h-4 w-4" />
      </motion.button>
    );
  }

  return (
    <>
      {/* Main Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed bottom-24 right-4 z-50 lg:bottom-6"
          >
            <Button
              onClick={() => setIsOpen(true)}
              size="lg"
              className={`rounded-full shadow-lg ${isMinimized ? 'h-12 w-12 p-0' : 'h-14 px-6'} bg-primary hover:bg-primary/90`}
            >
              <MessageCircle className={`${isMinimized ? 'h-5 w-5' : 'h-5 w-5 mr-2'}`} />
              {!isMinimized && <span>Need Help?</span>}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-4 z-50 lg:bottom-6 w-80"
          >
            <Card className="shadow-xl border-border/60">
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-primary" />
                  Help & Support
                </CardTitle>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => {
                      setIsOpen(false);
                      setIsMinimized(true);
                    }}
                  >
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={handleHide}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  How can we help you today?
                </p>
                
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-3"
                    onClick={() => {
                      navigate('/support');
                      setIsOpen(false);
                    }}
                  >
                    <HelpCircle className="h-4 w-4 text-primary" />
                    <div className="text-left">
                      <div className="font-medium text-sm">FAQs & Help Center</div>
                      <div className="text-xs text-muted-foreground">Find answers to common questions</div>
                    </div>
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-3"
                    onClick={() => {
                      window.location.href = 'mailto:support@yeild.com?subject=Support Request';
                      setIsOpen(false);
                    }}
                  >
                    <Mail className="h-4 w-4 text-primary" />
                    <div className="text-left">
                      <div className="font-medium text-sm">Email Support</div>
                      <div className="text-xs text-muted-foreground">Get help via email</div>
                    </div>
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-3"
                    onClick={() => {
                      navigate('/dashboard?tab=profile');
                      setIsOpen(false);
                    }}
                  >
                    <Send className="h-4 w-4 text-primary" />
                    <div className="text-left">
                      <div className="font-medium text-sm">Submit a Ticket</div>
                      <div className="text-xs text-muted-foreground">Report an issue or request</div>
                    </div>
                  </Button>
                </div>

                <div className="pt-2 border-t">
                  <p className="text-xs text-muted-foreground text-center">
                    We typically respond within 24 hours
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
