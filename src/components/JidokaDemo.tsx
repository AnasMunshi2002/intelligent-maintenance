import { useState } from "react";
import { motion } from "framer-motion";
import { Slider } from "@/components/ui/slider";
import { Bot, UserCheck, AlertTriangle } from "lucide-react";

const zones = [
  {
    label: "Human Required",
    range: "0–70%",
    icon: UserCheck,
    color: "text-red-400",
    bg: "bg-red-400/10",
    border: "border-red-400/30",
    description:
      "Confidence too low for automation. The issue is escalated to a developer for manual review, debugging, and resolution.",
  },
  {
    label: "Supervised Automation",
    range: "70–90%",
    icon: AlertTriangle,
    color: "text-amber-400",
    bg: "bg-amber-400/10",
    border: "border-amber-400/30",
    description:
      "AI generates a fix and opens a PR with an explanation. A developer reviews and approves before merge.",
  },
  {
    label: "Fully Automated",
    range: "90–100%",
    icon: Bot,
    color: "text-emerald-400",
    bg: "bg-emerald-400/10",
    border: "border-emerald-400/30",
    description:
      "High confidence — the system auto-applies the fix, deploys via CI/CD, and logs the action for audit.",
  },
];

function getZone(value: number) {
  if (value < 70) return 0;
  if (value < 90) return 1;
  return 2;
}

const JidokaDemo = () => {
  const [confidence, setConfidence] = useState(75);
  const zoneIndex = getZone(confidence);
  const zone = zones[zoneIndex];

  return (
    <section id="jidoka-demo" className="py-24 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-card/20 to-background" />
      <div className="relative z-10 container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            Jidoka <span className="text-gradient-primary">in Action</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Drag the slider to see how IntelliOps routes decisions based on AI confidence scores.
          </p>
        </motion.div>

        <div className="max-w-2xl mx-auto">
          {/* Slider */}
          <div className="mb-10">
            <div className="flex justify-between text-xs font-display text-muted-foreground mb-2">
              <span>0%</span>
              <span className="text-foreground font-bold text-lg">{confidence}%</span>
              <span>100%</span>
            </div>
            <Slider
              value={[confidence]}
              onValueChange={(v) => setConfidence(v[0])}
              min={0}
              max={100}
              step={1}
            />
            {/* Zone markers */}
            <div className="flex mt-2 text-[10px] font-display uppercase tracking-wider">
              <div className="w-[70%] text-red-400">Human</div>
              <div className="w-[20%] text-amber-400">Supervised</div>
              <div className="w-[10%] text-emerald-400 text-right">Auto</div>
            </div>
          </div>

          {/* Active zone card */}
          <motion.div
            key={zoneIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className={`rounded-xl border ${zone.border} ${zone.bg} p-8`}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className={`p-3 rounded-lg ${zone.bg}`}>
                <zone.icon className={`w-6 h-6 ${zone.color}`} />
              </div>
              <div>
                <h3 className={`font-display text-xl font-bold ${zone.color}`}>
                  {zone.label}
                </h3>
                <span className="font-display text-xs text-muted-foreground">{zone.range} confidence</span>
              </div>
            </div>
            <p className="text-foreground/80 leading-relaxed">{zone.description}</p>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default JidokaDemo;
