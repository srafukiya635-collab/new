import { useState } from "react";
import { Plus, Minus } from "lucide-react";
import { useSiteConfig } from "@/config/ConfigProvider";
import { Card, Section } from "./primitives";

export function Faq() {
  const { config } = useSiteConfig();
  const faq = config.faq;
  const [open, setOpen] = useState<number | null>(0);
  if (!faq.length) return null;

  return (
    <Section id="faq" eyebrow="FAQ" title="Good to know">
      <div className="grid gap-3">
        {faq.map((item, i) => {
          const isOpen = open === i;
          return (
            <Card key={item.question}>
              <button
                type="button"
                className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                onClick={() => setOpen(isOpen ? null : i)}
                aria-expanded={isOpen}
              >
                <span className="text-sm font-semibold uppercase tracking-[0.12em]">{item.question}</span>
                <span style={{ color: "var(--site-primary)" }}>
                  {isOpen ? <Minus size={16} /> : <Plus size={16} />}
                </span>
              </button>
              {isOpen && (
                <p className="px-6 pb-6 text-sm leading-relaxed" style={{ color: "var(--site-muted)" }}>
                  {item.answer}
                </p>
              )}
            </Card>
          );
        })}
      </div>
    </Section>
  );
}
