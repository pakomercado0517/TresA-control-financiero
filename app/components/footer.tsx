"use client";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-gray-600">
            <p className="font-semibold text-gray-900">TresA Control Financiero</p>
            <p className="text-xs text-gray-500 mt-1">
              Sistema de control financiero para empresas mexicanas
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-500 text-xs">© {currentYear}</span>
            <span className="text-[#0047AB] font-semibold">Created by TresA Design</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

