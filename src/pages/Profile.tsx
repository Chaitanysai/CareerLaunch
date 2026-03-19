import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useCity } from "@/hooks/useCity";
import { User, Mail, Briefcase, MapPin, Save, Plus, X, Camera, TrendingUp, Link } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Profile = () => {
  const { user } = useAuth();
  const { city } = useCity();
  const { toast } = useToast();

  const [profile, setProfile] = useState({
    name: user?.name || "",
    email: user?.email || "",
    title: "Full Stack Developer",
    location: city.name,
    bio: "Passionate software engineer with experience building scalable web applications for Indian startups and MNCs.",
    experience: "3-5",
    noticePeriod: "30",
    currentCTC: "",
    expectedCTC: "",
    linkedin: "",
    github: "",
    website: "",
    naukri: "",
  });

  const [skills, setSkills] = useState(["React", "TypeScript", "Node.js", "Python", "Tailwind CSS"]);
  const [newSkill, setNewSkill] = useState("");
  const [saving, setSaving] = useState(false);

  const addSkill = () => {
    const s = newSkill.trim();
    if (s && !skills.includes(s)) { setSkills([...skills, s]); setNewSkill(""); }
  };

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    setSaving(false);
    toast({ title: "Profile saved!", description: "Your profile has been updated." });
  };

  const fields = [profile.name, profile.title, profile.location, profile.bio, profile.linkedin || profile.github, profile.currentCTC];
  const score = Math.round((fields.filter(Boolean).length / fields.length) * 100);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold text-foreground">My Profile</h1>
        <p className="text-muted-foreground mt-1">Keep updated for better matches in {city.name}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left sidebar */}
        <div className="space-y-4">
          <Card className="card-shadow">
            <CardContent className="p-6 flex flex-col items-center text-center">
              <div className="relative mb-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={user?.avatar} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-bold">
                    {profile.name?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <button className="absolute bottom-0 right-0 w-7 h-7 bg-accent rounded-full flex items-center justify-center shadow-md hover:bg-accent/90 transition-colors">
                  <Camera className="h-3.5 w-3.5 text-white" />
                </button>
              </div>
              <h3 className="font-heading font-semibold text-foreground">{profile.name || "Your Name"}</h3>
              <p className="text-sm text-accent font-medium mt-0.5">{profile.title}</p>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <MapPin className="h-3 w-3" />{profile.location}
              </p>
            </CardContent>
          </Card>

          <Card className="card-shadow">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="h-4 w-4 text-accent" />
                <span className="font-heading font-semibold text-sm">Profile Strength</span>
              </div>
              <Progress value={score} className="h-2 mb-2" />
              <p className="text-xs text-muted-foreground">
                {score}% complete{score < 100 ? " — add more for better matches" : " — great!"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main form */}
        <div className="lg:col-span-2 space-y-5">

          {/* Basic Info */}
          <Card className="card-shadow">
            <CardHeader className="pb-4">
              <CardTitle className="font-heading text-base flex items-center gap-2">
                <User className="h-4 w-4 text-accent" />Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Full Name</Label>
                  <Input value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label>Email</Label>
                  <Input value={profile.email} disabled className="opacity-60" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Current Job Title</Label>
                  <Input value={profile.title} onChange={(e) => setProfile({ ...profile, title: e.target.value })} placeholder="e.g. Senior Developer" />
                </div>
                <div className="space-y-1.5">
                  <Label>Location (City)</Label>
                  <Input value={profile.location} onChange={(e) => setProfile({ ...profile, location: e.target.value })} placeholder="e.g. Bengaluru" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Experience Level</Label>
                  <Select value={profile.experience} onValueChange={(v) => setProfile({ ...profile, experience: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0-1">0–1 yrs (Fresher)</SelectItem>
                      <SelectItem value="1-3">1–3 yrs (Junior)</SelectItem>
                      <SelectItem value="3-5">3–5 yrs (Mid-level)</SelectItem>
                      <SelectItem value="5-8">5–8 yrs (Senior)</SelectItem>
                      <SelectItem value="8+">8+ yrs (Staff/Lead)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Notice Period</Label>
                  <Select value={profile.noticePeriod} onValueChange={(v) => setProfile({ ...profile, noticePeriod: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Immediate joiner</SelectItem>
                      <SelectItem value="15">15 days</SelectItem>
                      <SelectItem value="30">30 days</SelectItem>
                      <SelectItem value="60">60 days</SelectItem>
                      <SelectItem value="90">90 days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Bio / Summary</Label>
                <Textarea value={profile.bio} rows={3}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  placeholder="Brief professional summary..." />
              </div>
            </CardContent>
          </Card>

          {/* Salary (India-specific) */}
          <Card className="card-shadow">
            <CardHeader className="pb-4">
              <CardTitle className="font-heading text-base">Salary Details (₹ LPA)</CardTitle>
              <CardDescription>Helps match you with the right compensation bands</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Current CTC</Label>
                <Input placeholder="e.g. 12 LPA" value={profile.currentCTC}
                  onChange={(e) => setProfile({ ...profile, currentCTC: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Expected CTC</Label>
                <Input placeholder="e.g. 18 LPA" value={profile.expectedCTC}
                  onChange={(e) => setProfile({ ...profile, expectedCTC: e.target.value })} />
              </div>
            </CardContent>
          </Card>

          {/* Skills */}
          <Card className="card-shadow">
            <CardHeader className="pb-4">
              <CardTitle className="font-heading text-base">Skills</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 mb-4">
                {skills.map((s) => (
                  <Badge key={s} className="bg-accent/10 text-accent border-accent/20 gap-1.5 pr-1.5">
                    {s}
                    <button onClick={() => setSkills(skills.filter((x) => x !== s))} className="hover:text-destructive">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input placeholder="Add skill (e.g. React, AWS, Python)..."
                  value={newSkill} onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addSkill()} />
                <Button onClick={addSkill} variant="outline" size="icon"><Plus className="h-4 w-4" /></Button>
              </div>
            </CardContent>
          </Card>

          {/* Links */}
          <Card className="card-shadow">
            <CardHeader className="pb-4">
              <CardTitle className="font-heading text-base flex items-center gap-2">
                <Link className="h-4 w-4 text-accent" />Online Profiles
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { key: "linkedin", label: "LinkedIn", placeholder: "https://linkedin.com/in/yourname" },
                { key: "github", label: "GitHub", placeholder: "https://github.com/yourname" },
                { key: "naukri", label: "Naukri Profile", placeholder: "https://naukri.com/profile/yourname" },
                { key: "website", label: "Portfolio / Website", placeholder: "https://yoursite.com" },
              ].map(({ key, label, placeholder }) => (
                <div key={key} className="space-y-1.5">
                  <Label>{label}</Label>
                  <Input placeholder={placeholder} value={(profile as any)[key]}
                    onChange={(e) => setProfile({ ...profile, [key]: e.target.value })} />
                </div>
              ))}
            </CardContent>
          </Card>

          <Button onClick={handleSave} className="w-full gap-2" disabled={saving}>
            {saving ? <><div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Saving...</>
              : <><Save className="h-4 w-4" />Save Profile</>}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
