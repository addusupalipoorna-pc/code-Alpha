import React from 'react';

export default function SignUp() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center py-12">
      <div className="w-full max-w-3xl grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="p-8 bg-white dark:bg-gray-900 rounded-xl shadow-lg">
          <h2 className="text-2xl font-bold mb-4">Create your account</h2>
          <p className="text-sm text-gray-500 mb-6">Start translating with enterprise features and secure storage.</p>
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium">Full name</label>
              <input type="text" className="mt-1 input w-full" placeholder="Your name" />
            </div>
            <div>
              <label className="block text-sm font-medium">Email</label>
              <input type="email" className="mt-1 input w-full" placeholder="you@example.com" />
            </div>
            <div>
              <label className="block text-sm font-medium">Password</label>
              <input type="password" className="mt-1 input w-full" placeholder="Create a password" />
            </div>
            <div>
              <button type="submit" aria-label="Create account" className="w-full btn btn-primary">Create account</button>
            </div>
            <div className="text-center text-sm text-gray-500">
              Already have an account? <a href="#/signin" className="text-blue-600">Sign in</a>
            </div>
          </form>
        </div>

        <div className="hidden md:flex flex-col justify-center p-8 bg-gradient-to-br from-emerald-600 to-green-600 rounded-xl text-white shadow-lg">
          <h3 className="text-2xl font-semibold mb-2">Translate faster</h3>
          <p className="opacity-90">Secure collaboration, team management, and API access for your workflows.</p>
          <ul className="mt-6 space-y-2 text-sm">
            <li>• Team seats and admin controls</li>
            <li>• Enterprise SSO (SAML / OIDC)</li>
            <li>• Priority support</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
