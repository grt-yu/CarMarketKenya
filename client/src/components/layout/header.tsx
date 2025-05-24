import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Car, Plus, User, MessageCircle } from "lucide-react";

export default function Header() {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  // Mock auth state - in real app this would come from auth context
  const isAuthenticated = false;
  const user = null;

  const navigation = [
    { name: "Buy Cars", href: "/cars" },
    { name: "Sell Car", href: "/sell" },
    { name: "Blog", href: "/blog" },
    { name: "About", href: "/about" },
  ];

  const NavLinks = ({ mobile = false }: { mobile?: boolean }) => (
    <>
      {navigation.map((item) => (
        <Link
          key={item.name}
          href={item.href}
          className={`transition-colors hover:text-primary ${
            location === item.href ? "text-primary font-medium" : "text-neutral-700"
          } ${mobile ? "block px-3 py-2 text-base" : ""}`}
          onClick={() => mobile && setIsOpen(false)}
        >
          {item.name}
        </Link>
      ))}
    </>
  );

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50 border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Car className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold text-primary">CarHub Kenya</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <NavLinks />
          </nav>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/messages">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Messages
                  </Link>
                </Button>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/dashboard">
                    <User className="h-4 w-4 mr-2" />
                    Dashboard
                  </Link>
                </Button>
                <Button asChild>
                  <Link href="/sell">
                    <Plus className="h-4 w-4 mr-2" />
                    Sell Car
                  </Link>
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" size="sm" className="hidden md:inline-flex" asChild>
                  <Link href="/auth">Sign In</Link>
                </Button>
                <Button asChild>
                  <Link href="/sell">
                    <Plus className="h-4 w-4 mr-2" />
                    Sell Car
                  </Link>
                </Button>
              </>
            )}

            {/* Mobile Menu Button */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <nav className="flex flex-col space-y-4 mt-4">
                  <NavLinks mobile />
                  {!isAuthenticated && (
                    <>
                      <Button variant="outline" className="justify-start" asChild>
                        <Link href="/auth" onClick={() => setIsOpen(false)}>
                          Sign In
                        </Link>
                      </Button>
                      <Button variant="outline" className="justify-start" asChild>
                        <Link href="/auth" onClick={() => setIsOpen(false)}>
                          Register
                        </Link>
                      </Button>
                    </>
                  )}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
