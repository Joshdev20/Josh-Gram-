import LoginForm from '@/components/auth/LoginForm';
import Link from 'next/link';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h1 className="mt-6 text-center text-4xl font-extrabold text-gray-900">
          Josh Gram
        </h1>
        {/* Optional: You can add a logo here */}
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <LoginForm />
          <p className="mt-6 text-center text-sm text-gray-600">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="font-medium text-indigo-600 hover:text-indigo-500">
              Sign up
            </Link>
          </p>
          <p className="mt-2 text-center text-sm text-gray-600">
            <Link href="/password-reset" className="font-medium text-indigo-600 hover:text-indigo-500">
              Forgot your password?
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
