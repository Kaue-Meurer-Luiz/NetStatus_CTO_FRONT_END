import { Outlet } from 'react-router-dom';
import Navigation from './Navigation';

export default function Layout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
      
      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-sm text-gray-500">
              © 2025 Sistema de Conferências. Desenvolvido para gestão de conferências de caixas, por Kaue Meurer Luiz.
            </div>
            <div className="mt-2 md:mt-0 text-sm text-gray-500">
              Beta
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
