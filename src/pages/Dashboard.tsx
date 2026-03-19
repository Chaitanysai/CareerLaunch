import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useCity } from "@/hooks/useCity";
import {
  Briefcase, BookmarkCheck, TrendingUp, Target,
  ArrowRight, Upload, Sparkles, Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { AreaChart, Area, XAxis, YAxis, BarChart, Bar, ResponsiveContainer } from "recharts";

const matchActivity = [
  { week: "Wk 1", matches: 4 },
  { week: "Wk 2", matches: 8 },
  { week: "Wk 3", matches: 6 },
  { week: "Wk 4", matches: 14 },
  { week: "Wk 5", matches: 11 },
  { week: "Wk 6", matches: 18 },
];

const skillDemand = [
  { skill: "React", demand: 92 },
  { skill: "TypeScript", demand: 85 },
  { skill: "Node.js", demand: 78 },
  { skill: "Python", demand: 72 },
  { skill: "AWS", demand: 65 },
];

const chartConfig = {
  matches: { label: "Matches", color: "hsl(var(--accent))" },
};

const Dashboard = () => {
  const { user } = useAuth();
  const { city } = useCity();
  const navigate = useNavigate();

  const stats = [
    { label: "Total Matches", value: "61", change: "+18 this week", icon: Target, color: "text-accent" },
    { label: "Saved Jobs", value: "12", change: "3 new this week", icon: BookmarkCheck, color: "text-primary" },
    { label: "Profile Score", value: "78%", change: "+5% this month", icon: TrendingUp, color: "text-green-500" },
    { label: "Applications", value: "5", change: "2 in review", icon: Briefcase, color: "text-orange-500" },
  ];

  const recentJobs = [
    { title: "Senior Frontend Engineer", company: "Swiggy", match: 94, type: "Remote", posted: "2h ago" },
    { title: "Full Stack Developer", company: "Razorpay", match: 87, type: "Hybrid", posted: "5h ago" },
    { title: "React Developer", company: "PhonePe", match: 82, type: "On-site", posted: "1d ago" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">
            Welcome back, {user?.name?.split(" ")[0]} 👋
          </h1>
          <p className="text-muted-foreground mt-1">
            Showing opportunities in <span className="text-accent font-medium">{city.name}</span>
          </p>
        </div>
        <Button onClick={() => navigate("/match")} className="gap-2 self-start sm:self-auto">
          <Upload className="h-4 w-4" />
          Analyze Resume
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(({ label, value, change, icon: Icon, color }) => (
          <Card key={label} className="card-shadow">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-muted-foreground">{label}</span>
                <Icon className={`h-4 w-4 ${color}`} />
              </div>
              <div className="font-heading text-2xl font-bold text-foreground">{value}</div>
              <div className="text-xs text-muted-foreground mt-1">{change}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card className="card-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="font-heading text-base">Match Activity</CardTitle>
            <CardDescription>Job matches over the last 6 weeks</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-48">
              <AreaChart data={matchActivity}>
                <defs>
                  <linearGradient id="matchGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="week" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area type="monotone" dataKey="matches" stroke="hsl(var(--accent))" fill="url(#matchGrad)" strokeWidth={2} />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="card-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="font-heading text-base">Skill Demand in {city.name}</CardTitle>
            <CardDescription>Market demand for your top skills</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 pt-2">
            {skillDemand.map(({ skill, demand }) => (
              <div key={skill}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-foreground">{skill}</span>
                  <span className="text-muted-foreground">{demand}%</span>
                </div>
                <Progress value={demand} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Recent Matches */}
      <Card className="card-shadow mb-6">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <div>
            <CardTitle className="font-heading text-base">Recent Matches in {city.name}</CardTitle>
            <CardDescription>Jobs that match your profile</CardDescription>
          </div>
          <Button variant="ghost" size="sm" className="gap-1" onClick={() => navigate("/jobs")}>
            View all <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {recentJobs.map((job) => (
            <div key={job.title}
              className="flex items-center justify-between p-4 rounded-lg border border-border/50 hover:border-accent/30 hover:bg-muted/30 transition-all cursor-pointer"
              onClick={() => navigate("/jobs")}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="font-medium text-foreground text-sm truncate">{job.title}</p>
                  <Badge className="bg-accent/10 text-accent border-accent/20 text-xs shrink-0">
                    {job.match}% match
                  </Badge>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="font-medium text-accent">{job.company}</span>
                  <span>{job.type}</span>
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{job.posted}</span>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0 ml-4" />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* CTA */}
      <Card className="hero-gradient border-0 card-shadow">
        <CardContent className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="font-heading font-semibold text-white">Get AI-powered matches</p>
              <p className="text-white/70 text-sm">Upload your resume for Gemini AI analysis in {city.name}</p>
            </div>
          </div>
          <Button variant="secondary" className="bg-white text-primary hover:bg-white/90 shrink-0"
            onClick={() => navigate("/match")}>
            Analyze Resume
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
