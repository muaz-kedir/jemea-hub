import { forwardRef, useImperativeHandle, useRef } from "react";
import { cn } from "@/lib/utils";

interface SpotlightCardProps extends React.HTMLAttributes<HTMLDivElement> {
  glass?: boolean;
}

export const SpotlightCard = forwardRef<HTMLDivElement, SpotlightCardProps>(
  ({ className, children, glass = false, ...props }, ref) => {
    const innerRef = useRef<HTMLDivElement>(null);

    useImperativeHandle(ref, () => innerRef.current as HTMLDivElement);

    const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
      const node = innerRef.current;
      if (!node) return;

      const rect = node.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      node.style.setProperty("--spotlight-x", `${x}px`);
      node.style.setProperty("--spotlight-y", `${y}px`);
    };

    const handlePointerLeave = () => {
      const node = innerRef.current;
      if (!node) return;

      node.style.setProperty("--spotlight-x", "50%");
      node.style.setProperty("--spotlight-y", "50%");
    };

    return (
      <div
        ref={innerRef}
        className={cn(
          "group relative overflow-hidden rounded-3xl border border-white/10 bg-slate-950/70 p-6 transition-all duration-300",
          "hover:border-cyan-400/40 hover:shadow-[0_20px_45px_rgba(6,182,212,0.15)]",
          glass && "backdrop-blur-xl",
          className
        )}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        {...props}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background:
              "radial-gradient(500px circle at var(--spotlight-x, 50%) var(--spotlight-y, 50%), rgba(34,211,238,0.18), transparent 65%)",
          }}
        />
        <div className="relative z-[1]">
          {children}
        </div>
        <div className="pointer-events-none absolute inset-0 border border-white/5 rounded-3xl" />
      </div>
    );
  }
);

SpotlightCard.displayName = "SpotlightCard";
