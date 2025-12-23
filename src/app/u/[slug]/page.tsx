type UserPageProps = {
  params: { slug: string };
};

export default function UserPage({ params }: UserPageProps) {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col items-center px-6 py-16 text-center">
      <h1 className="font-display text-3xl font-bold text-foreground">
        Telegram user
      </h1>
      <p className="mt-3 text-base text-muted">{params.slug}</p>
    </main>
  );
}
