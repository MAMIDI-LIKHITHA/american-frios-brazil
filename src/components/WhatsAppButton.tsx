import { waLink } from "@/lib/site";

function WaIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.46 1.32 4.96L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91C21.96 6.45 17.5 2 12.04 2Zm5.8 14.02c-.25.7-1.45 1.34-2 1.4-.55.06-1.06.08-2.94-.72-2.22-.95-3.62-3.29-3.73-3.44-.11-.16-.9-1.24-.9-2.36s.58-1.67.79-1.9c.2-.23.44-.29.59-.29.15 0 .3 0 .43.01.14 0 .32-.05.5.38.18.44.62 1.52.68 1.63.06.11.1.24.02.39-.08.16-.15.25-.3.4-.15.16-.31.35-.44.47-.15.15-.3.31-.13.6.17.3.75 1.24 1.6 2 1.1.98 1.83 1.16 2.11 1.29.28.13.44.11.6-.07.16-.19.68-.8.87-1.07.19-.28.37-.22.62-.13.25.09 1.6.76 1.87.9.28.13.46.2.53.31.06.11.06.65-.19 1.35Z" />
    </svg>
  );
}

export function WhatsAppButton({
  message,
  children = "Peça pelo WhatsApp",
  className = "",
  size = "md",
}: {
  message?: string;
  children?: React.ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const sizes = {
    sm: "text-sm px-4 py-2",
    md: "",
    lg: "text-base px-6 py-3.5",
  } as const;

  return (
    <a
      href={waLink(message)}
      target="_blank"
      rel="noopener noreferrer"
      className={`btn-base btn-whatsapp ${sizes[size]} ${className}`}
    >
      <WaIcon className={size === "lg" ? "h-5 w-5" : "h-4 w-4"} />
      {children}
    </a>
  );
}

export { WaIcon };
