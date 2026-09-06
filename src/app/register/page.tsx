import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import RegistrationForm from '@/components/registration/RegistrationForm';

export const metadata: Metadata = {
  title: 'Register Your Land | Trinfra — Land-Pooling & Development Facilitation',
  description: 'Register your land with Trinfra. Join a transparent, collaborative land pooling process that unlocks greater value for your land and your community.',
};

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background font-sans text-foreground">
      <Navbar />
      <main className="flex-grow pt-[72px]">
        <RegistrationForm />
      </main>
    </div>
  );
}
