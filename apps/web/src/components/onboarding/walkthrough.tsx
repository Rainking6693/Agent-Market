'use client';

import { useEffect, useState } from 'react';
import { HelpCircle, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface TooltipConfig {
  id: string;
  selector: string;
  title: string;
  description: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

const tooltips: TooltipConfig[] = [
  {
    id: 'create-agent-btn',
    selector: '[data-tooltip="create-agent"]',
    title: 'Create Your First Agent',
    description: 'Click here to create a new AI agent. You\'ll define its capabilities, pricing, and schemas.',
    position: 'bottom',
  },
  {
    id: 'agent-list',
    selector: '[data-tooltip="agent-list"]',
    title: 'Your Agents',
    description: 'View and manage all your agents here. You can edit, disable, or delete agents.',
    position: 'right',
  },
  {
    id: 'marketplace',
    selector: '[data-tooltip="marketplace"]',
    title: 'Browse Marketplace',
    description: 'Discover and hire other agents from the marketplace. Agents can negotiate and pay each other autonomously.',
    position: 'bottom',
  },
  {
    id: 'wallet',
    selector: '[data-tooltip="wallet"]',
    title: 'Wallet & Budgets',
    description: 'Manage your wallet balance, set budgets, and configure spending limits for your agents.',
    position: 'left',
  },
];

export function Walkthrough() {
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  const [dismissedTooltips, setDismissedTooltips] = useState<string[]>([]);

  useEffect(() => {
    const dismissed = localStorage.getItem('walkthrough_dismissed');
    if (dismissed) {
      try {
        setDismissedTooltips(JSON.parse(dismissed));
      } catch (e) {
        // Invalid data
      }
    }
  }, []);

  const handleTooltipClick = (tooltipId: string) => {
    if (activeTooltip === tooltipId) {
      setActiveTooltip(null);
    } else {
      setActiveTooltip(tooltipId);
    }
  };

  const handleDismiss = (tooltipId: string) => {
    const newDismissed = [...dismissedTooltips, tooltipId];
    setDismissedTooltips(newDismissed);
    localStorage.setItem('walkthrough_dismissed', JSON.stringify(newDismissed));
    setActiveTooltip(null);
  };

  const tooltip = tooltips.find((t) => t.id === activeTooltip);
  const element = tooltip ? document.querySelector(tooltip.selector) : null;

  if (!element || dismissedTooltips.includes(activeTooltip || '')) {
    return null;
  }

  const rect = element.getBoundingClientRect();
  const position = tooltip?.position || 'bottom';

  const getPositionStyles = () => {
    switch (position) {
      case 'top':
        return {
          bottom: window.innerHeight - rect.top + 10,
          left: rect.left + rect.width / 2,
          transform: 'translateX(-50%)',
        };
      case 'bottom':
        return {
          top: rect.bottom + 10,
          left: rect.left + rect.width / 2,
          transform: 'translateX(-50%)',
        };
      case 'left':
        return {
          top: rect.top + rect.height / 2,
          right: window.innerWidth - rect.left + 10,
          transform: 'translateY(-50%)',
        };
      case 'right':
        return {
          top: rect.top + rect.height / 2,
          left: rect.right + 10,
          transform: 'translateY(-50%)',
        };
      default:
        return {};
    }
  };

  return (
    <>
      {/* Help button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          const firstUndismissed = tooltips.find((t) => !dismissedTooltips.includes(t.id));
          if (firstUndismissed) {
            setActiveTooltip(firstUndismissed.id);
          }
        }}
        className="fixed bottom-4 right-4 z-40 rounded-full shadow-lg"
        aria-label="Show help tooltips"
      >
        <HelpCircle className="h-4 w-4" />
      </Button>

      {/* Tooltip overlay */}
      {tooltip && (
        <div
          className="fixed z-50 w-80"
          style={getPositionStyles()}
        >
          <Card className="border-white/20 bg-black/95 shadow-2xl">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-white">{tooltip.title}</h3>
                <button
                  onClick={() => handleDismiss(tooltip.id)}
                  className="text-slate-400 hover:text-white transition-colors"
                  aria-label="Dismiss"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <p className="text-sm text-slate-300 mb-3">{tooltip.description}</p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const currentIndex = tooltips.findIndex((t) => t.id === tooltip.id);
                    const next = tooltips[currentIndex + 1];
                    if (next && !dismissedTooltips.includes(next.id)) {
                      setActiveTooltip(next.id);
                    } else {
                      setActiveTooltip(null);
                    }
                  }}
                >
                  Next
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDismiss(tooltip.id)}
                >
                  Got it
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
