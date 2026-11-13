'use client';

import { usePathname } from 'next/navigation';
import FraganoteFooter from './fraganote/FraganoteFooter';

export default function StorefrontFooterWrapper() {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');

  if (isAdmin) return null;
  return <FraganoteFooter />;
}
