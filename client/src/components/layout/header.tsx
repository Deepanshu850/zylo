import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Heart, Home, User, Menu, X } from "lucide-react";
import { LANGUAGES } from "@/lib/constants";

export default function Header() {
  const [location] = useLocation();
  const [language, setLanguage] = useState("en");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [favorites, setFavorites] = useState(3); // Mock favorites count

  const navigation = [
    { name: "Buy", href: "/search" },
    { name: "Projects", href: "/search?view=projects" },
    { name: "Builders", href: "/search?view=builders" },
    { name: "Market Intel", href: "/market" },
    { name: "Legal Check", href: "/legal" },
  ];

  const isActive = (href: string) => {
    if (href === "/" && location === "/") return true;
    return location.startsWith(href) && href !== "/";
  };

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-8">
            <Link href="/">
              <div className="flex items-center space-x-2 cursor-pointer">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Home className="h-4 w-4 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900">ZyloEstates</span>
                <Badge className="bg-success text-white">VERIFIED</Badge>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-6">
              {navigation.map((item) => (
                <Link key={item.name} href={item.href}>
                  <span
                    className={`font-medium cursor-pointer transition-colors ${
                      isActive(item.href)
                        ? "text-primary"
                        : "text-gray-700 hover:text-primary"
                    }`}
                  >
                    {item.name}
                  </span>
                </Link>
              ))}
            </nav>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* Language Selector */}
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.map((lang) => (
                  <SelectItem key={lang.code} value={lang.code}>
                    {lang.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Favorites */}
            <div className="relative">
              <Button variant="ghost" size="sm" className="relative">
                <Heart className="h-5 w-5 text-gray-600" />
                {favorites > 0 && (
                  <Badge className="absolute -top-1 -right-1 bg-primary text-white text-xs w-5 h-5 rounded-full flex items-center justify-center p-0">
                    {favorites}
                  </Badge>
                )}
              </Button>
            </div>

            {/* User Account */}
            <Button className="bg-primary hover:bg-primary-dark text-white hidden sm:flex">
              <User className="h-4 w-4 mr-2" />
              Login
            </Button>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <nav className="flex flex-col space-y-3">
              {navigation.map((item) => (
                <Link key={item.name} href={item.href}>
                  <span
                    className={`block px-3 py-2 rounded-md font-medium cursor-pointer transition-colors ${
                      isActive(item.href)
                        ? "text-primary bg-primary/5"
                        : "text-gray-700 hover:text-primary hover:bg-gray-50"
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.name}
                  </span>
                </Link>
              ))}
              <Button className="bg-primary hover:bg-primary-dark text-white mt-4">
                <User className="h-4 w-4 mr-2" />
                Login
              </Button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
