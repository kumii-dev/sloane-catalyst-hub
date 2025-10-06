import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Users, Pin, TrendingUp, UserPlus } from 'lucide-react';

interface MessagingTabsProps {
  selectedTab: 'recent' | 'contacts' | 'teams' | 'pinned' | 'insights';
  onTabChange: (tab: 'recent' | 'contacts' | 'teams' | 'pinned' | 'insights') => void;
}

export const MessagingTabs: React.FC<MessagingTabsProps> = ({ selectedTab, onTabChange }) => {
  const tabs = [
    { id: 'recent' as const, label: 'Recent', icon: Clock, badge: 8 },
    { id: 'contacts' as const, label: 'Contacts', icon: Users, badge: null },
    { id: 'teams' as const, label: 'Teams', icon: UserPlus, badge: 3 },
    { id: 'pinned' as const, label: 'Pinned', icon: Pin, badge: null },
    { id: 'insights' as const, label: 'Insights', icon: TrendingUp, badge: null },
  ];

  return (
    <div className="p-2 border-b border-border">
      <div className="space-y-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <Button
              key={tab.id}
              variant={selectedTab === tab.id ? 'secondary' : 'ghost'}
              className="w-full justify-start"
              onClick={() => onTabChange(tab.id)}
            >
              <Icon className="h-4 w-4 mr-2" />
              {tab.label}
              {tab.badge && (
                <Badge variant="secondary" className="ml-auto">
                  {tab.badge}
                </Badge>
              )}
            </Button>
          );
        })}
      </div>
    </div>
  );
};
