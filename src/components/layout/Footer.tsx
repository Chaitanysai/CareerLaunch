import { Link } from "react-router-dom";
import { Sparkles, Github, Twitter, Linkedin } from "lucide-react";

const Footer = () => (
  <footer className="border-t border-border/60 bg-background mt-auto">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

        {/* Brand */}
        <div className="md:col-span-1">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg hero-gradient flex items-center justify-center">
              <Sparkles className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="font-heading font-bold text-lg">
              Role<span className="text-accent">Match</span>
            </span>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            AI-powered career matching that connects talent with opportunity.
          </p>
          <div className="flex items-center gap-3 mt-4">
            <a href="https://github.com" target="_blank" rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors">
              <Github className="h-4 w-4" />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors">
              <Twitter className="h-4 w-4" />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors">
              <Linkedin className="h-4 w-4" />
            </a>
          </div>
        </div>

        {/* Product */}
        <div>
          <h4 className="font-heading font-semibold text-sm text-foreground mb-3">Product</h4>
          <ul className="space-y-2">
            {[
              { label: "Job Board", href: "/jobs" },
              { label: "Dashboard", href: "/dashboard" },
              { label: "Saved Jobs", href: "/saved" },
              { label: "My Profile", href: "/profile" },
            ].map(({ label, href }) => (
              <li key={href}>
                <Link to={href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Company */}
        <div>
          <h4 className="font-heading font-semibold text-sm text-foreground mb-3">Company</h4>
          <ul className="space-y-2">
            {["About", "Blog", "Careers", "Contact"].map((item) => (
              <li key={item}>
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  {item}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Legal */}
        <div>
          <h4 className="font-heading font-semibold text-sm text-foreground mb-3">Legal</h4>
          <ul className="space-y-2">
            {["Privacy Policy", "Terms of Service", "Cookie Policy"].map((item) => (
              <li key={item}>
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  {item}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-border/60 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} RoleMatch. All rights reserved.
        </p>
        <p className="text-xs text-muted-foreground">
          Built with ❤️ by Chaitanysai
        </p>
      </div>
    </div>
  </footer>
);

export default Footer;
