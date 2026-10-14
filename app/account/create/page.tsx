import { Suspense } from 'react';
import { AccountPanel } from '@/components/account/account-panel';
export default function CreateAccountPage() { return <Suspense><AccountPanel section="create" /></Suspense>; }
