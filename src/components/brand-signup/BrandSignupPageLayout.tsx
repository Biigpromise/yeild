
import React from 'react';

const BrandSignupPageLayout = ({ children }: { children: React.ReactNode }) => (
    <div className="min-h-screen w-full lg:grid lg:grid-cols-2 bg-yeild-black">
      <div className="hidden lg:block relative">
          <img
              src="https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?q=80&w=2070"
              alt="Person using a laptop"
              className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-yeild-black via-yeild-black/50 to-transparent" />
          <div className="relative h-full flex flex-col justify-end p-12 text-white">
            <span className="text-yeild-yellow text-4xl font-bold">YEILD</span>
            <p className="mt-4 text-2xl font-semibold">Join the forefront of user-driven marketing.</p>
            <p className="mt-2 text-gray-300">Connect with thousands of engaged users ready to test, review, and promote your products.</p>
          </div>
      </div>
      <div className="flex items-center justify-center p-6 sm:p-12 relative overflow-y-auto">
        <div className="w-full max-w-2xl">
          {children}
        </div>
      </div>
    </div>
);

export default BrandSignupPageLayout;
