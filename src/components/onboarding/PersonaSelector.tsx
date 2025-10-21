import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building2, Users, Wallet, Briefcase, GraduationCap, Building } from 'lucide-react';

interface PersonaSelectorProps {
  onSelectPersona: (persona: string) => void;
  onSkip: () => void;
}

const personas = [
  {
    id: 'smme_startup',
    title: 'SMME/Startup',
    description: 'Access funding, markets, and accelerate your business growth',
    icon: Building2,
  },
  {
    id: 'skills_development',
    title: 'Skills Development',
    description: 'Kumii Academy, job seekers, and skills enhancement',
    icon: GraduationCap,
  },
  {
    id: 'funder',
    title: 'Funder',
    description: 'Connect with investment-ready businesses and opportunities',
    icon: Wallet,
  },
  {
    id: 'service_provider',
    title: 'Service Provider',
    description: 'AWS, Microsoft, SAP, and professional service providers',
    icon: Briefcase,
  },
  {
    id: 'professional',
    title: 'Professional',
    description: 'Mentors, advisors, coaches, and industry experts',
    icon: Users,
  },
  {
    id: 'public_private_entity',
    title: 'Public/Private Entity',
    description: 'Organizations supporting the entrepreneurship ecosystem',
    icon: Building,
  },
];

const PersonaSelector = ({ onSelectPersona, onSkip }: PersonaSelectorProps) => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-primary/5 to-accent/10">
      <Card className="w-full max-w-4xl shadow-strong border-primary/20 bg-card/95 backdrop-blur">
        <CardHeader className="text-center space-y-4 pb-8">
          <div className="inline-block">
            <div className="h-1 w-24 mx-auto bg-gradient-to-r from-primary via-accent to-primary rounded-full animate-pulse" />
          </div>
          <CardTitle className="text-4xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            Welcome to Kumii
          </CardTitle>
          <CardDescription className="text-lg text-muted-foreground">
            Shape your future. Select your role to unlock personalized opportunities.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {personas.map((persona) => {
              const Icon = persona.icon;
              return (
                <Card
                  key={persona.id}
                  className="group cursor-pointer hover:shadow-strong transition-all duration-300 hover:scale-105 hover:border-primary/50 bg-card/80 backdrop-blur"
                  onClick={() => onSelectPersona(persona.id)}
                >
                  <CardHeader className="text-center space-y-4 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="flex justify-center relative z-10">
                      <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 group-hover:from-primary/20 group-hover:to-accent/20 transition-all duration-300 shadow-soft">
                        <Icon className="h-8 w-8 text-primary group-hover:scale-110 transition-transform duration-300" />
                      </div>
                    </div>
                    <div className="relative z-10">
                      <CardTitle className="text-lg font-semibold group-hover:text-primary transition-colors">
                        {persona.title}
                      </CardTitle>
                      <CardDescription className="text-sm mt-2 leading-relaxed">
                        {persona.description}
                      </CardDescription>
                    </div>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
          <div className="text-center">
            <Button variant="ghost" onClick={onSkip}>
              Skip for now
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PersonaSelector;
