'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Upload, LayoutDashboard, Home, ShoppingCart, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DataExportActions } from './data-export-actions';

const navigation = [
  { name: 'Inicio', href: '/', icon: Home },
  { name: 'Ingresos', href: '/upload', icon: Upload },
  { name: 'Gastos', href: '/expenses', icon: ShoppingCart },
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Configuración', href: '/settings', icon: Settings },
];

export function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-xl font-bold text-gray-900">
              EBN Financial Reports
            </Link>
            <div className="flex items-center gap-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>
          <DataExportActions />
        </div>
      </div>
    </nav>
  );
}

