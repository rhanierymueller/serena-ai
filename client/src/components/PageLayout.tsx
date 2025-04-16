import React from 'react';
import Header from './Header';
import Footer from './Footer';

interface PageLayoutProps {
  title?: string;
  backTo?: string;
  children: React.ReactNode;
  className?: string;
}

const PageLayout: React.FC<PageLayoutProps> = ({ title, backTo = '/', children, className }) => {
  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      <Header title={title} backTo={backTo} fixed />
      <main className={`flex-1 pt-24 pb-12 px-6 ${className || ''}`}>{children}</main>
      <Footer />
    </div>
  );
};

export default PageLayout;
