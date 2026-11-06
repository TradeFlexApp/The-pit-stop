import { clsx } from "clsx";

/** Text wordmark in pit-lane yellow with a hard black drop, in the spirit of the reference's chunky logo. */
export function Wordmark({ className, dark = false }: { className?: string; dark?: boolean }) {
  return (
    <span
      className={clsx("display inline-block whitespace-nowrap text-brand", className)}
      style={{ textShadow: dark ? "0.06em 0.06em 0 #ffffff" : "0.06em 0.06em 0 #0d0d0d", WebkitTextStroke: dark ? "0" : "0.5px #0d0d0d" }}
    >
      The Pit Stop
    </span>
  );
}
