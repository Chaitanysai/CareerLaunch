import { useState } from "react";
import { Search, SlidersHorizontal, X, Briefcase } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { MapPin, DollarSign, Clock, ExternalLink } from "lucide-react";
import { useCity } from "@/hooks/useCity";

interface Job {
  title: string;
  company: string;
  location: string;
  type: string;
  salaryMin: number;
  salaryMax: number;
  matchScore: number;
  description: string;
  skills: string[];
  url: string;
  postedDate: string;
}

const generateJobs = (cityName: string): Job[] => [
  { title: "Senior Frontend Engineer", company: "Flipkart", location: cityName, type: "Hybrid", salaryMin: 22, salaryMax: 35, matchScore: 94, description: "Build scalable frontend systems for India's largest e-commerce platform. Work with React, TypeScript and micro-frontends.", skills: ["React", "TypeScript", "GraphQL", "Micro-frontends"], url: "#", postedDate: "2h ago" },
  { title: "Full Stack Developer", company: "Razorpay", location: cityName, type: "Full-time", salaryMin: 18, salaryMax: 28, matchScore: 87, description: "Build payment infrastructure used by millions of Indian businesses. Full ownership of features end-to-end.", skills: ["React", "Node.js", "PostgreSQL", "AWS"], url: "#", postedDate: "5h ago" },
  { title: "React Developer", company: "Swiggy", location: cityName, type: "Full-time", salaryMin: 15, salaryMax: 25, matchScore: 82, description: "Build the app that feeds India. Work on high-traffic consumer products used by crores of users daily.", skills: ["React", "Redux", "TypeScript", "REST APIs"], url: "#", postedDate: "1d ago" },
  { title: "Software Engineer II", company: "CRED", location: cityName, type: "Full-time", salaryMin: 20, salaryMax: 30, matchScore: 79, description: "Build premium fintech products for India's creditworthy population. High ownership, fast-paced culture.", skills: ["TypeScript", "React", "Go", "Kafka"], url: "#", postedDate: "1d ago" },
  { title: "Frontend Engineer", company: "Zepto", location: cityName, type: "On-site", salaryMin: 16, salaryMax: 24, matchScore: 75, description: "Power India's fastest grocery delivery app. Work on real-time tracking, inventory and checkout flows.", skills: ["React Native", "React", "TypeScript", "Redis"], url: "#", postedDate: "2d ago" },
  { title: "UI Engineer", company: "Meesho", location: cityName, type: "Hybrid", salaryMin: 12, salaryMax: 20, matchScore: 71, description: "Enable small businesses across India to sell online. Build inclusive, vernacular-first shopping experiences.", skills: ["React", "TypeScript", "Tailwind CSS", "i18n"], url: "#", postedDate: "3d ago" },
  { title: "Software Development Engineer", company: "Amazon India", location: cityName, type: "Full-time", salaryMin: 25, salaryMax: 45, matchScore: 68, description: "Work on systems that power Amazon's India operations. Large-scale distributed systems engineering.", skills: ["Java", "React", "AWS", "System Design"], url: "#", postedDate: "3d ago" },
  { title: "Product Engineer", company: "PhonePe", location: cityName, type: "Full-time", salaryMin: 18, salaryMax: 30, matchScore: 65, description: "Build UPI-based payment experiences for 500M+ users. Work at the intersection of finance and technology.", skills: ["React", "Node.js", "TypeScript", "PostgreSQL"], url: "#", postedDate: "4d ago" },
];

const jobTypes = ["Full-time", "Part-time", "Contract", "Hybrid", "Remote"];
const workModes = ["On-site", "Hybrid", "Full-time", "Remote"];

const JobCard = ({ job }: { job: Job }) => {
  const scoreColor =
    job.matchScore >= 85 ? "bg-accent/10 text-accent border-accent/20" :
    job.matchScore >= 70 ? "bg-primary/10 text-primary border-primary/20" :
    "bg-muted text-muted-foreground border-border";

  return (
    <div className="bg-card rounded-xl p-5 card-shadow hover:card-shadow-hover transition-all border border-border/50 hover:border-accent/20 group">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h3 className="font-heading font-semibold text-base text-foreground">{job.title}</h3>
            <Badge className={`text-xs font-bold shrink-0 border ${scoreColor}`}>{job.matchScore}% match</Badge>
          </div>
          <p className="text-sm font-medium text-accent">{job.company}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mb-3">
        <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{job.location}</span>
        <span className="flex items-center gap-1"><Briefcase className="h-3 w-3" />{job.type}</span>
        <span className="flex items-center gap-1 font-semibold text-foreground">
          ₹{job.salaryMin}L – ₹{job.salaryMax}L
        </span>
        <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{job.postedDate}</span>
      </div>

      <p className="text-sm text-muted-foreground leading-relaxed mb-3 line-clamp-2">{job.description}</p>

      <div className="flex flex-wrap gap-1.5 mb-3">
        {job.skills.map((s) => (
          <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
        ))}
      </div>

      <a href={job.url} target="_blank" rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-accent hover:underline">
        View Job <ExternalLink className="h-3 w-3" />
      </a>
    </div>
  );
};

const FilterPanel = ({ filters, setFilters, onReset }: any) => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <h3 className="font-heading font-semibold text-foreground">Filters</h3>
      <Button variant="ghost" size="sm" onClick={onReset} className="text-muted-foreground h-auto p-0 hover:text-foreground text-xs">
        Reset all
      </Button>
    </div>

    <div>
      <Label className="text-sm font-medium mb-3 block">Job Type</Label>
      <div className="space-y-2">
        {jobTypes.map((type) => (
          <div key={type} className="flex items-center gap-2">
            <Checkbox id={type}
              checked={filters.types.includes(type)}
              onCheckedChange={(checked) =>
                setFilters((f: any) => ({ ...f, types: checked ? [...f.types, type] : f.types.filter((t: string) => t !== type) }))} />
            <label htmlFor={type} className="text-sm cursor-pointer">{type}</label>
          </div>
        ))}
      </div>
    </div>

    <Separator />

    <div>
      <Label className="text-sm font-medium mb-3 block">
        Min Salary: <span className="text-accent">₹{filters.minSalary}L</span>
      </Label>
      <Slider min={0} max={40} step={2} value={[filters.minSalary]}
        onValueChange={([v]) => setFilters((f: any) => ({ ...f, minSalary: v }))} />
    </div>

    <Separator />

    <div>
      <Label className="text-sm font-medium mb-3 block">
        Min Match: <span className="text-accent">{filters.minMatch}%</span>
      </Label>
      <Slider min={0} max={100} step={5} value={[filters.minMatch]}
        onValueChange={([v]) => setFilters((f: any) => ({ ...f, minMatch: v }))} />
    </div>
  </div>
);

const JobBoard = () => {
  const { city } = useCity();
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("match");
  const [filters, setFilters] = useState({ types: [], minSalary: 0, minMatch: 0 });

  const JOBS = generateJobs(city.name);

  const resetFilters = () => setFilters({ types: [], minSalary: 0, minMatch: 0 });

  const activeFilterCount = filters.types.length + (filters.minSalary > 0 ? 1 : 0) + (filters.minMatch > 0 ? 1 : 0);

  const filtered = JOBS
    .filter((job) => {
      const q = search.toLowerCase();
      const matchesSearch = !q || job.title.toLowerCase().includes(q) || job.company.toLowerCase().includes(q) || job.skills.some((s) => s.toLowerCase().includes(q));
      const matchesType = !filters.types.length || filters.types.includes(job.type);
      const matchesSalary = job.salaryMax >= filters.minSalary;
      const matchesScore = job.matchScore >= filters.minMatch;
      return matchesSearch && matchesType && matchesSalary && matchesScore;
    })
    .sort((a, b) => {
      if (sortBy === "match") return b.matchScore - a.matchScore;
      if (sortBy === "salary") return b.salaryMax - a.salaryMax;
      return a.title.localeCompare(b.title);
    });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold text-foreground">Job Board</h1>
        <p className="text-muted-foreground mt-1">
          {filtered.length} jobs in <span className="text-accent font-medium">{city.name}</span>
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder={`Search jobs in ${city.name}...`} className="pl-9"
            value={search} onChange={(e) => setSearch(e.target.value)} />
          {search && <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2">
            <X className="h-4 w-4 text-muted-foreground" />
          </button>}
        </div>

        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="match">Best Match</SelectItem>
            <SelectItem value="salary">Highest Salary</SelectItem>
            <SelectItem value="title">Job Title</SelectItem>
          </SelectContent>
        </Select>

        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="gap-2 sm:hidden">
              <SlidersHorizontal className="h-4 w-4" />
              Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
            </Button>
          </SheetTrigger>
          <SheetContent side="left">
            <SheetHeader className="mb-4"><SheetTitle>Filter Jobs</SheetTitle></SheetHeader>
            <FilterPanel filters={filters} setFilters={setFilters} onReset={resetFilters} />
          </SheetContent>
        </Sheet>
      </div>

      <div className="flex gap-6">
        {/* Desktop filter sidebar */}
        <aside className="hidden sm:block w-56 shrink-0">
          <div className="bg-card rounded-xl border border-border/50 p-5 card-shadow sticky top-24">
            <FilterPanel filters={filters} setFilters={setFilters} onReset={resetFilters} />
          </div>
        </aside>

        {/* Jobs */}
        <div className="flex-1 min-w-0">
          {activeFilterCount > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {filters.types.map((t: string) => (
                <Badge key={t} variant="secondary" className="gap-1">{t}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => setFilters((f: any) => ({ ...f, types: f.types.filter((x: string) => x !== t) }))} />
                </Badge>
              ))}
              {filters.minSalary > 0 && (
                <Badge variant="secondary" className="gap-1">₹{filters.minSalary}L+ salary
                  <X className="h-3 w-3 cursor-pointer" onClick={() => setFilters((f: any) => ({ ...f, minSalary: 0 }))} />
                </Badge>
              )}
            </div>
          )}

          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="font-heading font-semibold text-foreground">No jobs found</p>
              <p className="text-muted-foreground text-sm mt-1">Try adjusting your search or filters</p>
              <Button variant="outline" size="sm" className="mt-4" onClick={() => { setSearch(""); resetFilters(); }}>
                Clear all
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {filtered.map((job, i) => (
                <div key={i} className="animate-fade-in-up" style={{ animationDelay: `${i * 0.05}s`, opacity: 0 }}>
                  <JobCard job={job} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobBoard;
