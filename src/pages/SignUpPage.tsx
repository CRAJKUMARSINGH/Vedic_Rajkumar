import { SignUp } from '@clerk/react';

const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');

export default function SignUpPage() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center px-4"
      style={{ background: 'radial-gradient(ellipse at top, #2a1200 0%, #0d0500 60%, #000 100%)' }}>
      <div className="absolute inset-0 opacity-20"
        style={{ backgroundImage: 'radial-gradient(circle, #c8860a 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      <div className="relative z-10">
        <SignUp
          routing="path"
          path={`${basePath}/sign-up`}
          signInUrl={`${basePath}/sign-in`}
          fallbackRedirectUrl={`${basePath}/`}
        />
      </div>
    </div>
  );
}
