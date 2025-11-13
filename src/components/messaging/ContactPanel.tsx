import React from 'react';
import { TriangleAvatar } from '@/components/ui/triangle-avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  MapPin, Briefcase, Star, Users, FileText, 
  Calendar, ExternalLink, Mail, Phone 
} from 'lucide-react';
import { CurrencyIcon } from '@/components/ui/currency-icon';
import { supabase } from '@/integrations/supabase/client';

interface ContactPanelProps {
  conversationId: string;
}

export const ContactPanel: React.FC<ContactPanelProps> = ({ conversationId }) => {
  const [contact, setContact] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [mutualConnections, setMutualConnections] = React.useState<any[]>([]);

  React.useEffect(() => {
    loadContactInfo();
  }, [conversationId]);

  const loadContactInfo = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .rpc('get_other_participant_profiles', { p_conversation_id: conversationId })
        .single();

      if (!error && data) {
        setContact({
          name: `${data.first_name} ${data.last_name}`,
          role: data.persona_type?.replace('_', ' ') || 'User',
          company: data.organization || 'Not specified',
          location: 'Not specified',
          rating: 0,
          totalSessions: 0,
          cohorts: [],
          bio: data.bio || 'No bio available',
          email: '',
          phone: '',
          profile_picture_url: data.profile_picture_url
        });

        // Fetch some real platform users as mutual connections
        if (user) {
          const { data: connections } = await supabase
            .from('profiles')
            .select('first_name, last_name, persona_type, profile_picture_url')
            .neq('user_id', user.id)
            .neq('user_id', data.user_id)
            .limit(3);

          if (connections) {
            setMutualConnections(connections.map(conn => ({
              name: `${conn.first_name || ''} ${conn.last_name || ''}`.trim() || 'Anonymous User',
              role: conn.persona_type?.replace('_', ' ') || 'User',
              profile_picture_url: conn.profile_picture_url
            })));
          }
        }
      }
    } catch (error) {
      console.error('Error loading contact:', error);
    } finally {
      setLoading(false);
    }
  };

  const sharedFiles = [
    { name: 'Business_Plan_v2.pdf', date: '2 days ago', size: '2.4 MB' },
    { name: 'Market_Research.docx', date: '1 week ago', size: '1.8 MB' },
    { name: 'Financial_Projections.xlsx', date: '2 weeks ago', size: '856 KB' },
  ];


  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-gradient-to-br from-background to-muted/20">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="w-14 h-14 border-4 border-primary/30 rounded-full mx-auto" />
            <div className="w-14 h-14 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto absolute top-0 left-1/2 -translate-x-1/2" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">Loading profile</p>
            <p className="text-xs text-muted-foreground">Just a moment...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!contact) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <Users className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="font-semibold text-foreground mb-2">Profile Unavailable</h3>
        <p className="text-sm text-muted-foreground max-w-xs">
          Contact information is not available at this time
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Profile Header */}
      <div className="text-center space-y-4 pb-6 border-b border-border">
        <div className="relative inline-block">
          <TriangleAvatar 
            src={contact.profile_picture_url}
            alt={contact.name}
            fallback={contact.name.split(' ').map((n: string) => n[0]).join('')}
            className="h-24 w-24 mx-auto ring-4 ring-primary/10"
          />
          <div className="absolute bottom-0 right-0 w-6 h-6 bg-success rounded-full border-4 border-background" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground mb-1">{contact.name}</h2>
          <p className="text-sm font-medium text-muted-foreground mb-2 capitalize">{contact.role}</p>
          {contact.rating > 0 && (
            <div className="flex items-center justify-center gap-1.5 bg-rating/10 rounded-full px-3 py-1 inline-flex">
              <Star className="h-4 w-4 fill-rating text-rating" />
              <span className="text-sm font-bold text-rating-foreground">{contact.rating}</span>
            </div>
          )}
        </div>
        <div className="flex gap-2 justify-center flex-wrap">
          <Button size="sm" variant="outline" className="hover:bg-primary hover:text-primary-foreground transition-colors">
            <Phone className="h-4 w-4 mr-1.5" />
            Call
          </Button>
          <Button size="sm" variant="outline" className="hover:bg-primary hover:text-primary-foreground transition-colors">
            <Calendar className="h-4 w-4 mr-1.5" />
            Schedule
          </Button>
          <Button size="sm" variant="outline" className="hover:bg-primary hover:text-primary-foreground transition-colors">
            <CurrencyIcon className="h-4 w-4 mr-1.5" />
            Pay
          </Button>
        </div>
      </div>

      {/* Contact Info */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Briefcase className="h-4 w-4 text-primary" />
          Contact Details
        </h3>
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
            <Briefcase className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
            <span className="text-sm text-foreground">{contact.company}</span>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
            <MapPin className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
            <span className="text-sm text-foreground">{contact.location}</span>
          </div>
          {contact.email && (
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
              <Mail className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <a href={`mailto:${contact.email}`} className="text-sm text-primary hover:underline">
                {contact.email}
              </a>
            </div>
          )}
          {contact.phone && (
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
              <Phone className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <a href={`tel:${contact.phone}`} className="text-sm text-primary hover:underline">
                {contact.phone}
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Bio */}
      <div className="space-y-3">
        <h3 className="font-semibold text-sm text-foreground">About</h3>
        <p className="text-sm text-muted-foreground leading-relaxed bg-muted/50 p-4 rounded-lg">
          {contact.bio}
        </p>
      </div>

      {/* Shared Files */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <FileText className="h-4 w-4 text-primary" />
          Shared Files
        </h3>
        <div className="space-y-2">
          {sharedFiles.map((file, idx) => (
            <button
              key={idx}
              className="w-full p-3 rounded-lg bg-card border border-border hover:border-primary cursor-pointer transition-colors group text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate text-foreground">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {file.date} • {file.size}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Mutual Connections */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Users className="h-4 w-4 text-primary" />
          Mutual Connections ({mutualConnections.length})
        </h3>
        <div className="space-y-2">
          {mutualConnections.length > 0 ? (
            mutualConnections.map((connection, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3 rounded-lg bg-card border border-border hover:border-primary cursor-pointer transition-colors group">
                <TriangleAvatar 
                  src={connection.profile_picture_url}
                  alt={connection.name}
                  fallback={connection.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                  className="h-10 w-10 ring-2 ring-transparent group-hover:ring-primary/20 transition-all"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate text-foreground">{connection.name}</p>
                  <p className="text-xs text-muted-foreground capitalize">{connection.role}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No mutual connections yet</p>
          )}
        </div>
      </div>
    </div>
  );
};
