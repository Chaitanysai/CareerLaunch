import { Badge } from "@/components/ui/badge";
import { User, Target } from "lucide-react";

interface SkillsSummaryProps {
  skills: string[];
  suggestedTitle: string;
  experience: string;
}

const SkillsSummary = ({ skills, suggestedTitle, experience }: SkillsSummaryProps) => (
  <div className="bg-card rounded-lg p-6 card-shadow border border-border/50">
    <h3 className="font-heading font-semibold text-lg text-card-foreground mb-4 flex items-center gap-2">
      <User className="h-5 w-5 text-accent" />
      Resume Summary
    </h3>

    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Target className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Target Role:</span>
        <span className="text-sm font-medium text-card-foreground">{suggestedTitle}</span>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Experience:</span>
        <span className="text-sm font-medium text-card-foreground">{experience}</span>
      </div>

      <div>
        <p className="text-sm text-muted-foreground mb-2">Key Skills:</p>
        <div className="flex flex-wrap gap-1.5">
          {skills.map((skill) => (
            <Badge key={skill} className="bg-accent/10 text-accent border-accent/20 text-xs">
              {skill}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export default SkillsSummary;
