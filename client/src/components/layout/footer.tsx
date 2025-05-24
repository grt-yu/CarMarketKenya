import { Link } from "wouter";
import { Car, Facebook, Twitter, Instagram, Linkedin } from "lucide-react";

export default function Footer() {
  const footerSections = [
    {
      title: "For Buyers",
      links: [
        { name: "Browse Cars", href: "/cars" },
        { name: "Search by Make", href: "/cars?filter=make" },
        { name: "Financing Options", href: "/finance" },
        { name: "Car Insurance", href: "/insurance" },
        { name: "Buying Guide", href: "/blog?category=buying-guide" },
      ],
    },
    {
      title: "For Sellers",
      links: [
        { name: "List Your Car", href: "/sell" },
        { name: "Pricing Guide", href: "/pricing" },
        { name: "Seller Dashboard", href: "/dashboard" },
        { name: "Premium Listings", href: "/premium" },
        { name: "Selling Tips", href: "/blog?category=selling-tips" },
      ],
    },
    {
      title: "Support",
      links: [
        { name: "Help Center", href: "/help" },
        { name: "Contact Us", href: "/contact" },
        { name: "Safety Tips", href: "/safety" },
        { name: "Terms of Service", href: "/terms" },
        { name: "Privacy Policy", href: "/privacy" },
      ],
    },
  ];

  const socialLinks = [
    { icon: Facebook, href: "#", label: "Facebook" },
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Instagram, href: "#", label: "Instagram" },
    { icon: Linkedin, href: "#", label: "LinkedIn" },
  ];

  return (
    <footer className="bg-neutral-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-2">
              <Car className="h-8 w-8 text-secondary" />
              <span className="text-xl font-bold">CarHub Kenya</span>
            </Link>
            <p className="text-neutral-400 text-sm">
              Kenya's premier automotive marketplace connecting buyers and sellers with trust and transparency.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="text-neutral-400 hover:text-white transition-colors"
                  aria-label={social.label}
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Footer Sections */}
          {footerSections.map((section) => (
            <div key={section.title} className="space-y-4">
              <h3 className="text-lg font-semibold">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-neutral-400 hover:text-white transition-colors text-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Section */}
        <div className="border-t border-neutral-800 mt-8 pt-8 flex flex-col md:flex-row items-center justify-between">
          <p className="text-neutral-400 text-sm">
            © 2024 CarHub Kenya. All rights reserved.
          </p>
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <span className="text-neutral-400 text-sm">Secure payments with:</span>
            <div className="flex items-center space-x-2">
              <span className="bg-accent px-2 py-1 rounded text-xs font-medium">M-Pesa</span>
              <span className="bg-blue-600 px-2 py-1 rounded text-xs font-medium">Visa</span>
              <span className="bg-red-600 px-2 py-1 rounded text-xs font-medium">Mastercard</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
