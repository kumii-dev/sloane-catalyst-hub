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
    description: 'Growing businesses seeking funding and support',
    icon: Building2,
  },
  {
    id: 'job_seeker',
    title: 'Job Seeker',
    description: 'Professionals seeking opportunities',
    icon: Users,
  },
  {
    id: 'funder',
    title: 'Funder',
    description: 'Investors and grant providers',
    icon: Wallet,
  },
  {
    id: 'service_provider',
    title: 'Service Provider',
    description: 'Offering business services and solutions',
    icon: Briefcase,
  },
  {
    id: 'mentor_advisor',
    title: 'Mentor/Advisor',
    description: 'Sharing expertise and guidance',
    icon: GraduationCap,
  },
  {
    id: 'public_private_entity',
    title: 'Public/Private Entity',
    description: 'Organizations supporting the ecosystem',
    icon: Building,
  },
];

const PersonaSelector = ({ onSelectPersona, onSkip }: PersonaSelectorProps) => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 main-gradient-light">
      <Card className="w-full max-w-4xl shadow-strong">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl">Welcome to 22 On Sloane</CardTitle>
          <CardDescription className="text-lg">
            Help us customise your experience by selecting your role
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {personas.map((persona) => {
              const Icon = persona.icon;
              return (
                <Card
                  key={persona.id}
                  className="cursor-pointer hover:shadow-medium transition-all hover:scale-105"
                  onClick={() => onSelectPersona(persona.id)}
                >
                  <CardHeader className="text-center space-y-4">
                    <div className="flex justify-center">
                      <div className="p-4 rounded-full bg-primary/10">
                        <Icon className="h-8 w-8 text-primary" />
                      </div>
                    </div>
                    <div>
                      <CardTitle className="text-lg">{persona.title}</CardTitle>
                      <CardDescription className="text-sm mt-2">
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
