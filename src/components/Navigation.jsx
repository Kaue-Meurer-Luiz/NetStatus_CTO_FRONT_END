import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Home,
  Plus,
  List,
  Calendar,
  Menu,
  X,
  Activity,
  Sun,
  Moon
} from 'lucide-react';
import { useTheme } from '../App'; // Importar o hook de tema

export default function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { theme, toggleTheme } = useTheme(); // Usar o tema

  const navigationItems = [
    {
      name: 'Dashboard',
      href: '/',
      icon: Home,
      description: 'Visão geral do sistema'
    },
    {
      name: 'Nova Conferência',
      href: '/nova',
      icon: Plus,
      description: 'Cadastrar nova conferência'
    },
    {
      name: 'Todas as Conferências',
      href: '/conferencias',
      icon: List,
      description: 'Ver todas as conferências'
    }
  ];

  const isActive = (href) => {
    if (href === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(href);
  };

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="sticky top-0 z-50 hidden md:flex bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 px-6 py-4 transition-colors duration-300">
        <div className="flex items-center justify-between w-full max-w-7xl mx-auto">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <img src="/logo.png" alt="Logo" className="h-16 w-32 object-contain" />
            </div>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center space-x-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              
              return (
                <Link key={item.name} to={item.href}>
                  <Button
                    variant={active ? "default" : "ghost"}
                    className={`flex items-center space-x-2 ${
                      active 
                        ? 'bg-primary text-primary-foreground' 
                        : 'text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Button>
                </Link>
              );
            })}
          </div>

          {/* Status Badge & Theme Toggle */}
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="rounded-full w-10 h-10 dark:text-slate-300 dark:hover:bg-slate-800"
              title={theme === 'light' ? 'Ativar Modo Escuro' : 'Ativar Modo Claro'}
            >
              {theme === 'light' ? (
                <Moon className="h-5 w-5 text-slate-700" />
              ) : (
                <Sun className="h-5 w-5 text-yellow-400" />
              )}
            </Button>
            
            <Badge variant="outline" className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              Sistema Ativo
            </Badge>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <nav className="md:hidden bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 transition-colors duration-300">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Mobile Logo */}
            <div className="flex items-center space-x-2">
              <img src="/logo.png" alt="Logo" className="h-16 w-32 object-contain" />
            </div>

            <div className="flex items-center space-x-2">
              {/* Mobile Theme Toggle */}
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="rounded-full w-10 h-10 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                {theme === 'light' ? (
                  <Moon className="h-5 w-5 text-slate-700" />
                ) : (
                  <Sun className="h-5 w-5 text-yellow-400" />
                )}
              </Button>

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 dark:text-slate-300"
              >
                {mobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="mt-4 pb-4 border-t border-gray-200 dark:border-slate-800">
              <div className="pt-4 space-y-2">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Button
                        variant={active ? "default" : "ghost"}
                        className={`w-full justify-start space-x-3 ${
                          active 
                            ? 'bg-primary text-primary-foreground' 
                            : 'text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:bg-slate-800'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        <div className="text-left">
                          <div className="font-medium">{item.name}</div>
                          <div className="text-xs opacity-70">
                            {item.description}
                          </div>
                        </div>
                      </Button>
                    </Link>
                  );
                })}
              </div>

              {/* Mobile Status */}
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-800">
                <Badge variant="outline" className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  Sistema Ativo
                </Badge>
              </div>
            </div>
          )}
        </div>
      </nav>
    </>
  );
}
