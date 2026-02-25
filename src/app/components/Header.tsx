import { Link } from 'react-router';
import { ShoppingCart, User, Menu, Search, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { Button } from './ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';

export function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const { itemCount } = useCart();
  const { currencyOverride, supportedCurrencies, setCurrencyOverride, clearCurrencyOverride } = useCurrency();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#e8ddd2] bg-[#fffaf6]/95 backdrop-blur supports-[backdrop-filter]:bg-[#fffaf6]/80">
      <div className="container mx-auto px-4 flex h-16 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <span className="font-serif text-2xl">Revive Roots Essentials</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <Link to="/shop" className="text-sm hover:opacity-70 transition-opacity">
            Shop
          </Link>
          <Link to="/about" className="text-sm hover:opacity-70 transition-opacity">
            About
          </Link>
          <Link to="/contact" className="text-sm hover:opacity-70 transition-opacity">
            Contact
          </Link>
        </nav>

        {/* Right Side Icons */}
        <div className="flex items-center space-x-4">
          <div className="hidden lg:flex items-center gap-2">
            <span className="text-xs text-muted-foreground uppercase tracking-wide">Currency</span>
            <Select
              value={currencyOverride || 'AUTO'}
              onValueChange={(value) => {
                if (value === 'AUTO') {
                  clearCurrencyOverride();
                } else {
                  setCurrencyOverride(value);
                }
                window.location.reload();
              }}
            >
              <SelectTrigger size="sm" className="min-w-[140px]">
                <SelectValue placeholder="Auto (IP)" />
              </SelectTrigger>
              <SelectContent align="end">
                <SelectItem value="AUTO">Auto (IP)</SelectItem>
                {supportedCurrencies.map((currency) => (
                  <SelectItem key={currency} value={currency}>
                    {currency}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                clearCurrencyOverride();
                window.location.reload();
              }}
            >
              Clear
            </Button>
          </div>

          <Button variant="ghost" size="icon" className="hidden md:flex">
            <Search className="h-5 w-5" />
          </Button>

          {isAuthenticated ? (
            <>
              <Link to="/cart" className="relative">
                <Button variant="ghost" size="icon">
                  <ShoppingCart className="h-5 w-5" />
                  {itemCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-black text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {itemCount}
                    </span>
                  )}
                </Button>
              </Link>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div>
                      <p className="font-medium">{user?.name}</p>
                      <p className="text-xs text-muted-foreground">{user?.email}</p>
                      <p className="text-xs text-muted-foreground mt-1 capitalize">
                        Role: {user?.role}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/orders">My Orders</Link>
                  </DropdownMenuItem>
                  {(user?.role === 'admin' || user?.role === 'superadmin') && (
                    <DropdownMenuItem asChild>
                      <Link to="/dashboard">Dashboard</Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Link to="/login">
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
            </Link>
          )}

          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px]">
              <nav className="flex flex-col space-y-4 mt-8">
                <div className="flex flex-col gap-2">
                  <span className="text-xs text-muted-foreground uppercase tracking-wide">Currency</span>
                  <Select
                    value={currencyOverride || 'AUTO'}
                    onValueChange={(value) => {
                      if (value === 'AUTO') {
                        clearCurrencyOverride();
                      } else {
                        setCurrencyOverride(value);
                      }
                      window.location.reload();
                    }}
                  >
                    <SelectTrigger size="sm">
                      <SelectValue placeholder="Auto (IP)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AUTO">Auto (IP)</SelectItem>
                      {supportedCurrencies.map((currency) => (
                        <SelectItem key={currency} value={currency}>
                          {currency}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      clearCurrencyOverride();
                      window.location.reload();
                    }}
                  >
                    Clear
                  </Button>
                </div>
                <Link to="/shop" className="text-lg hover:opacity-70 transition-opacity">
                  Shop
                </Link>
                <Link to="/about" className="text-lg hover:opacity-70 transition-opacity">
                  About
                </Link>
                <Link to="/contact" className="text-lg hover:opacity-70 transition-opacity">
                  Contact
                </Link>
                {isAuthenticated && (
                  <>
                    <Link to="/cart" className="text-lg hover:opacity-70 transition-opacity">
                      Cart ({itemCount})
                    </Link>
                    <Link to="/profile" className="text-lg hover:opacity-70 transition-opacity">
                      Profile
                    </Link>
                    <Link to="/orders" className="text-lg hover:opacity-70 transition-opacity">
                      My Orders
                    </Link>
                    {(user?.role === 'admin' || user?.role === 'superadmin') && (
                      <Link to="/dashboard" className="text-lg hover:opacity-70 transition-opacity">
                        Dashboard
                      </Link>
                    )}
                  </>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
