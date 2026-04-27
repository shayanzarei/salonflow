type Props = {
  title: string;
  description: string;
};

export function TemplatePlaceholder({ title, description }: Props) {
  return (
    <div className="bg-white px-4 py-16 sm:px-6 sm:py-24">
      <div className="mx-auto max-w-4xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-500">
          Website Template
        </p>
        <h1 className="mt-3 text-4xl font-bold text-ink-900 sm:text-5xl">{title}</h1>
        <p className="mx-auto mt-4 max-w-2xl text-sm text-ink-500 sm:text-base">
          {description}
        </p>
      </div>
    </div>
  );
}
