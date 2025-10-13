import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Search, Users, Briefcase, GraduationCap, Building2, TrendingUp, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SmartContactSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectContact: (userId: string, userData: any) => void;
}

interface SuggestedContact {
  id: string;
  name: string;
  email: string;
  profile_picture_url?: string;
  persona_type: string;
  context: string;
  organization?: string;
  recent_activity?: string;
}

export const SmartContactSelector: React.FC<SmartContactSelectorProps> = ({
  open,
  onOpenChange,
  onSelectContact
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestedContacts, setSuggestedContacts] = useState<SuggestedContact[]>([]);
  const [searchResults, setSearchResults] = useState<SuggestedContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      loadSmartSuggestions();
      setSearchQuery('');
      setSearchResults([]);
    }
  }, [open]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim()) {
        searchAllUsers();
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const loadSmartSuggestions = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get user's profile to determine persona
      const { data: profile } = await supabase
        .from('profiles')
        .select('persona_type')
        .eq('user_id', user.id)
        .single();

      let suggestions: SuggestedContact[] = [];

      // Smart suggestions based on persona type
      if (profile?.persona_type === 'smme_startup') {
        // Show mentors, funders, and service providers
        const { data: mentors } = await supabase
          .from('mentors')
          .select(`
            id,
            user_id,
            title,
            profiles!inner(first_name, last_name, email, profile_picture_url, organization)
          `)
          .limit(5);

        const { data: funders } = await supabase
          .from('funders')
          .select(`
            id,
            user_id,
            organization_name,
            profiles!inner(first_name, last_name, email, profile_picture_url)
          `)
          .limit(5);

        if (mentors) {
          suggestions = suggestions.concat(
            mentors.map((m: any) => ({
              id: m.user_id,
              name: `${m.profiles.first_name} ${m.profiles.last_name}`,
              email: m.profiles.email,
              profile_picture_url: m.profiles.profile_picture_url,
              persona_type: 'mentor',
              context: `Mentor - ${m.title}`,
              organization: m.profiles.organization
            }))
          );
        }

        if (funders) {
          suggestions = suggestions.concat(
            funders.map((f: any) => ({
              id: f.user_id,
              name: `${f.profiles.first_name} ${f.profiles.last_name}`,
              email: f.profiles.email,
              profile_picture_url: f.profiles.profile_picture_url,
              persona_type: 'funder',
              context: `Funder at ${f.organization_name}`,
              organization: f.organization_name
            }))
          );
        }
      } else if (profile?.persona_type === 'mentor_advisor') {
        // Show mentees and other mentors
        const { data: sessions } = await supabase
          .from('mentoring_sessions')
          .select(`
            mentee_id,
            profiles!inner(first_name, last_name, email, profile_picture_url, organization)
          `)
          .eq('mentor_id', user.id)
          .limit(10);

        if (sessions) {
          suggestions = sessions.map((s: any) => ({
            id: s.mentee_id,
            name: `${s.profiles.first_name} ${s.profiles.last_name}`,
            email: s.profiles.email,
            profile_picture_url: s.profiles.profile_picture_url,
            persona_type: 'startup',
            context: 'Your Mentee',
            organization: s.profiles.organization
          }));
        }
      } else if (profile?.persona_type === 'funder') {
        // Show startups who applied
        const { data: applications } = await supabase
          .from('funding_applications')
          .select(`
            applicant_id,
            status,
            profiles!inner(first_name, last_name, email, profile_picture_url, organization)
          `)
          .limit(10);

        if (applications) {
          suggestions = applications.map((a: any) => ({
            id: a.applicant_id,
            name: `${a.profiles.first_name} ${a.profiles.last_name}`,
            email: a.profiles.email,
            profile_picture_url: a.profiles.profile_picture_url,
            persona_type: 'startup',
            context: `Applied - ${a.status}`,
            organization: a.profiles.organization,
            recent_activity: `Application ${a.status}`
          }));
        }
      }

      setSuggestedContacts(suggestions);
    } catch (error) {
      console.error('Error loading suggestions:', error);
      toast({
        title: 'Error',
        description: 'Failed to load contact suggestions',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const searchAllUsers = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, user_id, first_name, last_name, email, organization, profile_picture_url, persona_type')
        .or(`email.ilike.%${searchQuery}%,first_name.ilike.%${searchQuery}%,last_name.ilike.%${searchQuery}%,organization.ilike.%${searchQuery}%`)
        .limit(20);

      if (error) throw error;

      const results: SuggestedContact[] = (data || []).map(profile => ({
        id: profile.user_id,
        name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Anonymous User',
        email: profile.email || '',
        profile_picture_url: profile.profile_picture_url || undefined,
        persona_type: profile.persona_type || 'unassigned',
        organization: profile.organization || undefined,
        context: 'Search result',
        recent_activity: undefined
      }));

      setSearchResults(results);
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setSearching(false);
    }
  };

  const displayContacts = searchQuery.trim() ? searchResults : suggestedContacts;

  const getPersonaIcon = (persona: string) => {
    switch (persona) {
      case 'mentor': return <GraduationCap className="h-4 w-4" />;
      case 'funder': return <TrendingUp className="h-4 w-4" />;
      case 'startup': return <Briefcase className="h-4 w-4" />;
      default: return <Users className="h-4 w-4" />;
    }
  };

  const getPersonaColor = (persona: string) => {
    switch (persona) {
      case 'mentor': return 'bg-blue-500/10 text-blue-700 dark:text-blue-300';
      case 'funder': return 'bg-green-500/10 text-green-700 dark:text-green-300';
      case 'startup': return 'bg-purple-500/10 text-purple-700 dark:text-purple-300';
      default: return 'bg-gray-500/10 text-gray-700 dark:text-gray-300';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Start a Conversation
          </DialogTitle>
        </DialogHeader>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, or organization..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex-1 overflow-y-auto space-y-2">
          {(loading || searching) ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : displayContacts.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="font-medium">{searchQuery.trim() ? 'No users found' : 'No suggested contacts'}</p>
              <p className="text-sm mt-1">{searchQuery.trim() ? 'Try a different search term' : 'Start typing to search for users'}</p>
            </div>
          ) : (
            displayContacts.map((contact) => (
              <button
                key={contact.id}
                onClick={() => {
                  onSelectContact(contact.id, contact);
                  onOpenChange(false);
                }}
                className="w-full p-4 rounded-lg border border-border hover:border-primary hover:bg-accent/50 transition-all duration-200 text-left group"
              >
                <div className="flex items-start gap-3">
                  <Avatar className="h-12 w-12 ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all">
                    <AvatarImage src={contact.profile_picture_url} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {contact.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                        {contact.name}
                      </h4>
                      <Badge variant="secondary" className={`${getPersonaColor(contact.persona_type)} text-xs`}>
                        <span className="mr-1">{getPersonaIcon(contact.persona_type)}</span>
                        {contact.persona_type}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-1">{contact.email}</p>
                    
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {contact.organization && (
                        <span className="flex items-center gap-1">
                          <Building2 className="h-3 w-3" />
                          {contact.organization}
                        </span>
                      )}
                      {contact.context && (
                        <Badge variant="outline" className="text-xs">
                          {contact.context}
                        </Badge>
                      )}
                    </div>

                    {contact.recent_activity && (
                      <p className="text-xs text-primary mt-2 flex items-center gap-1">
                        <Sparkles className="h-3 w-3" />
                        {contact.recent_activity}
                      </p>
                    )}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
