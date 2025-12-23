"use client";

type HomeHeadlineProps = {
  line1: string;
  line2: string;
};

export function HomeHeadline({ line1, line2 }: HomeHeadlineProps) {
  return (
    <div className="mb-8 space-y-4 text-center max-sm:space-y-3">
      <p
        className="font-display text-[60px] font-bold text-foreground max-md:text-[40px] max-sm:text-[24px]"
        aria-label={`${line1} ${line2}`}
      >
        <span className="block animate-fade-left animate-slow">
          {renderHeadlineWithIcon(line1)}
        </span>
        <span className="block animate-fade-left animate-slow">{line2}</span>
      </p>
    </div>
  );
}

function renderHeadlineWithIcon(text: string) {
  const token = "Telegram";
  const index = text.indexOf(token);
  if (index === -1) {
    return text;
  }
  const before = text.slice(0, index + token.length);
  const after = text.slice(index + token.length);
  return (
    <>
      {before}
      <img
        src="/telegram-plane.svg"
        alt="Telegram"
        draggable={false}
        className="ml-3 inline-block h-[70px] w-[70px] align-middle max-md:h-[58px] max-md:w-[58px] max-sm:h-[50px] max-sm:w-[50px]"
      />
      {after}
    </>
  );
}
