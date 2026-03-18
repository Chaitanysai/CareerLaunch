import { Briefcase, MapPin, DollarSign, Clock, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export interface Job {
  title: string;
  company: string;
  location: string;
  type: string;
  salary: string;
  matchScore: number;
  description: string;
  skills: string[];
  url: string;
  postedDate: string;
}

const JobCard = ({ job }: { job: Job }) => {
  const scoreColor =
    job.matchScore >= 85 ? "bg-accent text-accent-foreground" :
    job.matchScore >= 70 ? "bg-primary text-primary-foreground" :
    "bg-muted text-muted-foreground";

  return (
    <div className="group bg-card rounded-lg p-6 card-shadow hover:card-shadow-hover transition-all duration-300 border border-border/50 hover:border-accent/30">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1">
            <h3 className="font-heading font-semibold text-lg text-card-foreground truncate">
              {job.title}
            </h3>
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full shrink-0 ${scoreColor}`}>
              {job.matchScore}% match
            </span>
          </div>

          <p className="text-base font-medium text-accent">{job.company}</p>

          <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" /> {job.location}
            </span>
            <span className="flex items-center gap-1.5">
              <Briefcase className="h-3.5 w-3.5" /> {job.type}
            </span>
            <span className="flex items-center gap-1.5">
              <DollarSign className="h-3.5 w-3.5" /> {job.salary}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" /> {job.postedDate}
            </span>
          </div>
        </div>
      </div>

      <p className="mt-4 text-sm text-muted-foreground leading-relaxed line-clamp-2">
        {job.description}
      </p>

      <div className="flex flex-wrap gap-1.5 mt-4">
        {job.skills.map((skill) => (
          <Badge key={skill} variant="secondary" className="text-xs font-medium">
            {skill}
          </Badge>
        ))}
      </div>

      {job.url && (
        <a
          href={job.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 mt-4 text-sm font-medium text-accent hover:underline"
        >
          View Job <ExternalLink className="h-3.5 w-3.5" />
        </a>
      )}
    </div>
  );
};

export default JobCard;
