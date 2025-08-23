import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const FloatingNavbar = ({ viewerType: propViewerType }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const [viewerType, setViewerType] = useState('guest');
  const [orgId, setOrgId] = useState(null);
  const [hasProfile, setHasProfile] = useState(false);

  const token = localStorage.getItem('authToken');

  const isOrgDashboardPage = location.pathname.startsWith('/org-dashboard');
  const isOrgRegisterPage = location.pathname === '/register-org';
  const isDefaultPage = ['/', '/login', '/signup', '/about'].includes(location.pathname);

  useEffect(() => {
    if (!token) {
      setViewerType('guest');
    } else if (propViewerType === 'owner') {
      setViewerType('owner');
    } else {
      setViewerType('authenticated');
    }

    if (token) {
      // Check profile
      fetch('http://localhost:8000/api/users/get-id/', {
        headers: { Authorization: `Token ${token}` },
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) setHasProfile(true);
        })
        .catch(() => setHasProfile(false));

      // Check organization
      fetch('http://localhost:8000/api/organization/get-org-id/', {
        headers: { Authorization: `Token ${token}` },
      })
        .then(res => res.json())
        .then(data => {
          if (data.organization_id) {
            setOrgId(data.organization_id);
          } else {
            setOrgId(null);
          }
        })
        .catch(() => setOrgId(null));
    }
  }, [location.pathname, propViewerType, token]);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setViewerType('guest');
    navigate('/login');
  };

  const handleBackToProfile = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/users/get-id/', {
        headers: { Authorization: `Token ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        navigate(`/profile/${data.profile_id}`);
      }
    } catch (err) {
      console.error("Error navigating to profile:", err);
    }
  };

  // Dynamic menu items based on viewer type and current page
  const getMenuItems = () => {
    const baseItems = [
      { label: "Home", href: "/" },
      { label: "About", href: "/about" },
    ];

    if (viewerType === 'owner') {
      if (isOrgDashboardPage) {
        return [
          ...baseItems,
          { label: "Back to Profile", action: handleBackToProfile },
          { label: "Set Interview", href: "/interview" },
        ];
      } else if (orgId) {
        return [
          ...baseItems,
          { label: "Go to Organization", href: `/org-dashboard/${orgId}` },
        ];
      } else {
        return [
          ...baseItems,
          { label: "Register as Organization", href: "/register-org" },
        ];
      }
    }

    if (viewerType === 'authenticated' && hasProfile) {
      if (isOrgDashboardPage || isOrgRegisterPage) {
        return [
          ...baseItems,
          { label: "Back to Profile", action: handleBackToProfile },
        ];
      } else if (orgId) {
        return [
          ...baseItems,
          { label: "Go to Organization", href: `/org-dashboard/${orgId}` },
        ];
      } else {
        return [
          ...baseItems,
          { label: "Register as Organization", href: "/register-org" },
        ];
      }
    }

    return baseItems;
  };

  const getAuthItems = () => {
    if (viewerType === 'guest') {
      return [
        { label: "Login", href: "/login" },
        { label: "Sign Up", href: "/signup" },
      ];
    }
    return [{ label: "Logout", action: handleLogout, className: "text-red-400" }];
  };

  const menuItems = getMenuItems();
  const authItems = getAuthItems();

  return (
    <section className="fixed top-5 left-1/2 z-50 w-[min(90%,900px)] -translate-x-1/2 lg:top-8">
      <nav className="glassmorphic rounded-full border border-white/30 bg-gradient-to-r from-violet-300 via-purple-200 to-white backdrop-blur-xl shadow-lg">
        <div className="flex items-center justify-between px-6 py-3">
          {/* Logo */}
          <a href="/" className="flex shrink-0 items-center gap-2" title="InterXAI">
            <div className="flex relative">
              <div className="w-6 h-6 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full animate-pulse"></div>
              <div className="w-6 h-6 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full -ml-3 animate-pulse delay-150"></div>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-black to-gray-700 bg-clip-text text-transparent">
              InterXAI
            </span>
          </a>
          
          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            {menuItems.map((item, index) => (
              item.action ? (
                <button
                  key={index}
                  onClick={item.action}
                  className="text-sm font-medium text-black/80 hover:text-black transition-all duration-300 hover:scale-105"
                >
                  {item.label}
                </button>
              ) : (
                <a
                  key={index}
                  href={item.href}
                  className="text-sm font-medium text-black/80 hover:text-black transition-all duration-300 hover:scale-105"
                >
                  {item.label}
                </a>
              )
            ))}
          </div>
          
          {/* Auth Items */}
          <div className="flex items-center gap-3">
            {authItems.map((item, index) => (
              item.action ? (
                <button
                  key={index}
                  onClick={item.action}
                  className={`hidden sm:block text-sm font-medium transition-colors ${
                    item.className || "text-black/80 hover:text-black"
                  }`}
                >
                  {item.label}
                </button>
              ) : (
                <a
                  key={index}
                  href={item.href}
                  className="hidden sm:block text-sm font-medium text-black/80 hover:text-black transition-colors"
                >
                  {item.label}
                </a>
              )
            ))}
            
            {/* Mobile Menu Button */}
            <button
              className="lg:hidden p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <div className="w-5 h-5 flex flex-col justify-center items-center">
                <span className={`block w-full h-0.5 bg-black transition-all duration-300 ${isMenuOpen ? 'rotate-45 translate-y-0.5' : '-translate-y-1'}`}></span>
                <span className={`block w-full h-0.5 bg-black transition-all duration-300 ${isMenuOpen ? 'opacity-0' : 'opacity-100'}`}></span>
                <span className={`block w-full h-0.5 bg-black transition-all duration-300 ${isMenuOpen ? '-rotate-45 -translate-y-0.5' : 'translate-y-1'}`}></span>
              </div>
            </button>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 right-0 mt-2 rounded-2xl border border-white/20 bg-white/95 backdrop-blur-xl p-6 shadow-xl">
            <div className="flex flex-col space-y-4">
              {menuItems.map((item, index) => (
                item.action ? (
                  <button
                    key={index}
                    onClick={() => {
                      item.action();
                      setIsMenuOpen(false);
                    }}
                    className="text-left text-base font-medium text-slate-700 hover:text-indigo-500 transition-colors py-2"
                  >
                    {item.label}
                  </button>
                ) : (
                  <a
                    key={index}
                    href={item.href}
                    className="text-base font-medium text-slate-700 hover:text-indigo-500 transition-colors py-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.label}
                  </a>
                )
              ))}
              
              {authItems.length > 0 && (
                <div className="border-t border-slate-200 pt-4">
                  {authItems.map((item, index) => (
                    item.action ? (
                      <button
                        key={index}
                        onClick={() => {
                          item.action();
                          setIsMenuOpen(false);
                        }}
                        className={`block text-left w-full text-base font-medium transition-colors py-2 ${
                          item.className ? "text-red-400 hover:text-red-600" : "text-slate-700 hover:text-indigo-500"
                        }`}
                      >
                        {item.label}
                      </button>
                    ) : (
                      <a
                        key={index}
                        href={item.href}
                        className="block text-base font-medium text-slate-700 hover:text-indigo-500 transition-colors py-2"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {item.label}
                      </a>
                    )
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
    </section>
  );
};

export default FloatingNavbar;