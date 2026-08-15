import { useState } from "react";
import { useSiteConfig } from "@/config/ConfigProvider";
import { rgba } from "@/lib/site";

interface Props {
  src?: string;
  alt: string;
  className?: string;
  label?: string;
  eager?: boolean;
}

/**
 * Image with guaranteed visual output: if the source is missing or fails to
 * load we render a branded gradient tile with the label instead of a broken
 * image icon or an empty black box.
 */
export function SafeImage({ src, alt, className = "", label, eager }: Props) {
  const { config } = useSiteConfig();
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        className={`grid h-full w-full place-items-center p-3 text-center ${className}`}
        style={{
          background: `linear-gradient(150deg, ${rgba(config.branding.primaryColor, 0.45)}, ${rgba(
            config.branding.accentColor,
            0.35,
          )}, ${rgba(config.branding.backgroundColor, 0.9)})`,
        }}
        role="img"
        aria-label={alt}
      >
        {label !== "" && (
          <span className="text-xs font-black uppercase leading-tight tracking-wide">
            {label ?? alt}
          </span>
        )}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      onError={() => setFailed(true)}
      className={`h-full w-full object-cover ${className}`}
    />
  );
}

export default SafeImage;
