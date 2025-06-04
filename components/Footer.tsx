// components/Footer.tsx

import Link from "next/link";

const Footer = () => {
  return (
    <footer className="text-white py-10 border-t border-gray-900 max-w-7xl mx-auto ">
      <div className="flex w-full justify-between xl:px-40 px-10 flex-col md:flex-row gap-10">
        {/* Logo + Description */}
        <div>
          <Link
            href="/"
            className="font-extrabold md:text-3xl text-[#00CBF1] tracking-widest"
          >
            Infinite Ideas Hub
          </Link>
          <p className="text-lg md:text-xl font-semibold capitalize mt-5">
            A super minimal & lightweight theme, <br /> refined for excellence.
          </p>
        </div>

        {/* Pages */}
        <div className="flex gap-10">
          <div>
            <h3 className="text-md md:text-lg font-semibold uppercase mb-5">
              Pages
            </h3>
            <ul className="space-y-2 text-lg">
              <li>
                <Link href="/" className="hover:underline">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/authors" className="hover:underline">
                  Authors
                </Link>
              </li>
              <li>
                <Link href="/categories" className="hover:underline">
                  Categories
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
