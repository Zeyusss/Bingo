"use client";
import { Facebook, Instagram, Youtube, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const Footer = () => {
  return (
    <footer className="bg-black text-white pt-12 pb-4 px-4">
      <div className="max-w-screen-xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {/* Logo & Socials */}
        <div>
          <Link href="/" className="text-2xl font-bold flex items-center gap-2">
            <Image
              src="/logo-white.svg"
              alt="Logo"
              width={36}
              height={36}
              className="invert"
            />
            BINGO.
          </Link>
          <div className="mt-6">
            <h4 className="text-lg font-semibold mb-2">Subscribe us:</h4>
            <div className="flex gap-4 mt-2">
              <Link
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Facebook className="w-5 h-5 text-blue-500 hover:scale-110 transition" />
              </Link>
              <Link
                href="https://x.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                <X className="w-5 h-5 hover:scale-110 transition" />
              </Link>
              <Link
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Instagram className="w-5 h-5 text-pink-500 hover:scale-110 transition" />
              </Link>
              <Link
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Youtube className="w-5 h-5 text-red-500 hover:scale-110 transition" />
              </Link>
            </div>
          </div>
        </div>

        {/* Useful Links */}
        <div>
          <h4 className="text-lg font-semibold mb-4">Useful links</h4>
          <ul className="space-y-2 text-sm text-gray-300">
            <li>
              <Link href="/about">About Us</Link>
            </li>
            <li>
              <Link href="/contact">Contact Us</Link>
            </li>
            <li>
              <Link href="/showrooms">Showrooms</Link>
            </li>
            <li>
              <Link href="/blog">Blog</Link>
            </li>
            <li>
              <Link href="/gift-cards">Gift Cards</Link>
            </li>
          </ul>
        </div>

        {/* Categories with filter */}
        <div>
          <h4 className="text-lg font-semibold mb-4">Categories</h4>
          <div className="grid grid-cols-2 gap-x-8 text-sm text-gray-300">
            <ul className="space-y-2">
              <li>
                <Link href="/products?categories=Jewelry">Jewelry</Link>
              </li>
              <li>
                <Link href="/products?categories=Clothing">Clothing</Link>
              </li>
              <li>
                <Link href="/products?categories=Home%20Decor">Home Decor</Link>
              </li>
              <li>
                <Link href="/products?categories=Art">Art</Link>
              </li>
              <li>
                <Link href="/products?categories=Toys">Toys</Link>
              </li>
            </ul>
            <ul className="space-y-2">
              <li>
                <Link href="/products?categories=Accessories">Accessories</Link>
              </li>
              <li>
                <Link href="/products?categories=Bags">Bags</Link>
              </li>
              <li>
                <Link href="/products?categories=Ceramics">Ceramics</Link>
              </li>
              <li>
                <Link href="/products?categories=Woodwork">Woodwork</Link>
              </li>
              <li>
                <Link href="/products?categories=Knitting">Knitting</Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Mobile App */}
        <div>
          <h4 className="text-lg font-semibold mb-4">
            Download App on Mobile:
          </h4>
          <p className="text-sm text-gray-300 mb-4">
            15% discount on your first purchase
          </p>
          <div className="flex gap-4 mb-4">
            <Link
              href="https://play.google.com/store/apps"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                src="/assets/Footer/google-play.svg"
                alt="Google Play"
                width={130}
                height={40}
              />
            </Link>
            <Link
              href="https://apps.apple.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                src="/assets/Footer/app-store.svg"
                alt="App Store"
                width={130}
                height={40}
              />
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-700 mt-10 pt-6 flex flex-col md:flex-row justify-between items-center max-w-screen-xl mx-auto">
        <p className="text-sm text-gray-400">
          Bingo © 2025 CREATED BY{" "}
          <span className="font-semibold text-white">BINGO TEAM</span>. PREMIUM
          E-COMMERCE SOLUTIONS.
        </p>
        <Image
          src="/assets/Footer/payments.png"
          alt="Payments"
          width={250}
          height={24}
          className="mt-4 md:mt-0"
        />
      </div>
    </footer>
  );
};

export default Footer;
