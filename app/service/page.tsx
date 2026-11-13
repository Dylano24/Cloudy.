import { notFound } from 'next/navigation';
import { siteSections } from '@/lib/site-sections';
import ArchivedWebSolutionsPage from './archived-page';

export default function WebSolutionsPage() {
  if (!siteSections.webSolutions) notFound();
  return <ArchivedWebSolutionsPage />;
}
