import { Shield, Cpu, GitBranch } from "lucide-react";

const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary/10 border border-primary/20">
            <Cpu className="w-4 h-4 text-primary" />
          </div>
          <span className="font-display text-sm font-bold tracking-wider text-foreground">IntelliOps</span>
        </div>
        
        <div className="hidden md:flex items-center gap-8">
          {[
            { label: "Architecture", href: "#architecture" },
            { label: "Assessment", href: "#assessment-demo" },
            { label: "Intelligence", href: "#intelligence-layer" },
            { label: "Metrics", href: "#metrics" },
            { label: "Case Studies", href: "#case-studies" },
            { label: "Jidoka Demo", href: "#jidoka-demo" },
          ].map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="font-display text-xs uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors"
            >
              {item.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full border border-primary/30 bg-primary/5">
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-glow" />
            <span className="font-display text-[10px] text-primary uppercase tracking-wider">Live</span>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
