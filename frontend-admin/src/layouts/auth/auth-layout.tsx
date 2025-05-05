import AppLogo from '@/components/AppLogo';
import { type PropsWithChildren } from 'react';
import { Link } from 'react-router';

interface AuthLayoutProps {
  name?: string;
  title?: string;
  description?: string;
}

export default function AuthSimpleLayout({
  children,
  title,
  description,
}: PropsWithChildren<AuthLayoutProps>) {
  return (
    <div className="bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col items-center gap-4">
            <Link
              to="/"
              className="flex flex-col items-center gap-2 font-medium"
            >
              <div className="mb-8 flex h-9 items-center justify-center rounded-md">
                <AppLogo />
              </div>
              <span className="sr-only">{title}</span>
            </Link>

            <div className="space-y-2 text-center">
              <h1 className="text-xl font-medium">{title}</h1>
              <p className="text-muted-foreground text-center text-sm">
                {description}
              </p>
            </div>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
