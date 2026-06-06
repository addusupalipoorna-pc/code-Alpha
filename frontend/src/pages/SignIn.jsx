import React from 'react';

export default function SignIn() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center py-12">
      <div className="w-full max-w-3xl grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="hidden md:flex flex-col justify-center p-8 bg-gradient-to-br from-sky-700 to-indigo-700 rounded-xl text-white shadow-lg">
          <h3 className="text-2xl font-semibold mb-2">Welcome back</h3>
          <p className="opacity-90">Sign in to access translations, history, and enterprise features.</p>
          <ul className="mt-6 space-y-2 text-sm">
            <li>• Secure, enterprise-grade translation</li>
            <li>• Fast multilingual support</li>
            <li>• Collaborative workflows</li>
          </ul>
        </div>

        <div className="p-8 bg-white dark:bg-gray-900 rounded-xl shadow-lg">
          <h2 className="text-2xl font-bold mb-4">Sign in to your account</h2>
          <div className="flex gap-3 mb-4">
            <button aria-label="Continue with Google" className="flex-1 btn btn-outline">Continue with Google</button>
            <button aria-label="Continue with Microsoft" className="flex-1 btn btn-outline">Continue with Microsoft</button>
          </div>
          <div className="text-center text-sm text-gray-400 mb-4">or use your email</div>
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium">Email</label>
              <input type="email" className="mt-1 input w-full" placeholder="you@example.com" />
            </div>
            <div>
              <label className="block text-sm font-medium">Password</label>
              <input type="password" className="mt-1 input w-full" placeholder="Enter password" />
            </div>
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" /> Remember me</label>
              <a href="#" className="text-sm text-blue-500">Forgot?</a>
            </div>
            <div>
              <button type="submit" aria-label="Sign in" className="w-full btn btn-primary">Sign In</button>
            </div>
            <div className="text-center text-sm text-gray-500">
              Don't have an account? <a href="#/signup" className="text-blue-600">Create one</a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
