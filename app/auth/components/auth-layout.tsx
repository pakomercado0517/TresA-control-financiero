'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  linkText: string;
  linkHref: string;
  children: ReactNode;
}

export function AuthLayout({
  title,
  subtitle,
  linkText,
  linkHref,
  children,
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {title}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {subtitle}{' '}
            <Link
              href={linkHref}
              className="font-medium text-primary hover:text-primary/80"
            >
              {linkText}
            </Link>
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}

