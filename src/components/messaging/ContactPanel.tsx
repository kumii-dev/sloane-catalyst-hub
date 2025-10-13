import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  MapPin, Briefcase, Star, Users, FileText, 
  Calendar, DollarSign, ExternalLink, Mail, Phone 
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface ContactPanelProps {
  conversationId: string;
}

export const ContactPanel: React.FC<ContactPanelProps> = ({ conversationId }) => {
  const [contact, setContact] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    loadContactInfo();
  }, [conversationId]);

  const loadContactInfo = async () => {
    try {
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

  const mutualConnections = [
    { name: 'John Smith', role: 'Entrepreneur' },
    { name: 'Maria Garcia', role: 'Investor' },
    { name: 'David Chen', role: 'Mentor' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full p-6">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!contact) {
    return (
      <div className="flex items-center justify-center h-full p-6 text-center text-muted-foreground">
        <p>No contact information available</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Profile Header */}
      <div className="text-center">
        <Avatar className="h-24 w-24 mx-auto mb-4">
          <AvatarImage src={contact.profile_picture_url} />
          <AvatarFallback className="text-2xl">
            {contact.name.split(' ').map((n: string) => n[0]).join('')}
          </AvatarFallback>
        </Avatar>
        <h2 className="text-xl font-bold text-foreground">{contact.name}</h2>
        <p className="text-sm text-muted-foreground mb-2">{contact.role}</p>
        
        <div className="flex items-center justify-center gap-1 mb-4">
          <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
          <span className="font-semibold text-foreground">{contact.rating}</span>
          <span className="text-sm text-muted-foreground">
            ({contact.totalSessions} sessions)
          </span>
        </div>

        <div className="flex gap-2 justify-center">
          <Button size="sm" variant="default">
            <Calendar className="h-4 w-4 mr-2" />
            Schedule
          </Button>
          <Button size="sm" variant="outline">
            <DollarSign className="h-4 w-4 mr-2" />
            Pay
          </Button>
        </div>
      </div>

      <Separator />

      {/* Contact Info */}
      <div className="space-y-3">
        <h3 className="font-semibold text-sm text-foreground">Contact Information</h3>
        
        <div className="flex items-center gap-2 text-sm">
          <Briefcase className="h-4 w-4 text-muted-foreground" />
          <span className="text-foreground">{contact.company}</span>
        </div>
        
        <div className="flex items-center gap-2 text-sm">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <span className="text-foreground">{contact.location}</span>
        </div>
        
        <div className="flex items-center gap-2 text-sm">
          <Mail className="h-4 w-4 text-muted-foreground" />
          <a href={`mailto:${contact.email}`} className="text-primary hover:underline">
            {contact.email}
          </a>
        </div>
        
        <div className="flex items-center gap-2 text-sm">
          <Phone className="h-4 w-4 text-muted-foreground" />
          <a href={`tel:${contact.phone}`} className="text-primary hover:underline">
            {contact.phone}
          </a>
        </div>
      </div>

      <Separator />

      {/* Bio */}
      <div className="space-y-2">
        <h3 className="font-semibold text-sm text-foreground">About</h3>
        <p className="text-sm text-muted-foreground">{contact.bio}</p>
      </div>

      <Separator />

      {/* Shared Cohorts */}
      <div className="space-y-2">
        <h3 className="font-semibold text-sm text-foreground">Shared Cohorts</h3>
        <div className="flex flex-wrap gap-2">
          {contact.cohorts.map((cohort, idx) => (
            <Badge key={idx} variant="secondary" className="text-xs">
              {cohort}
            </Badge>
          ))}
        </div>
      </div>

      <Separator />

      {/* Shared Files */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm text-foreground">Shared Files</h3>
          <Button variant="ghost" size="sm">
            <ExternalLink className="h-3 w-3" />
          </Button>
        </div>
        <div className="space-y-2">
          {sharedFiles.map((file, idx) => (
            <button
              key={idx}
              className="w-full p-2 rounded-lg hover:bg-accent transition-colors text-left"
            >
              <div className="flex items-start gap-2">
                <FileText className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
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

      <Separator />

      {/* Mutual Connections */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <h3 className="font-semibold text-sm text-foreground">
            Mutual Connections ({mutualConnections.length})
          </h3>
        </div>
        <div className="space-y-2">
          {mutualConnections.map((connection, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-xs">{connection.name[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate text-foreground">{connection.name}</p>
                <p className="text-xs text-muted-foreground">{connection.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
