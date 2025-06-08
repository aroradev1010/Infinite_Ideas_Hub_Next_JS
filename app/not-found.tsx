import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen  text-white px-4 pb-40 md:pb-20">
      <div className="text-center">
        <h1 className="text-6xl font-extrabold mb-4">404</h1>
        <p className="text-xl mb-8">
          Oops! The page you&apos;re looking for doesn&apos;t exist.
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-3 bg-primary hover:bg-primary/80 text-white font-bold rounded-lg transition duration-300"
        >
          Go Back Home
        </Link>
      </div>
    </div>
  );
}
