<template>
  <footer class="bg-neutral-900 text-white py-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex flex-col md:flex-row justify-between">
        <div class="mb-6 md:mb-0">
          <div class="flex items-center">
            <span class="text-xl font-bold">EV Charge</span>
            <span class="ml-1 text-secondary-400">Hub</span>
          </div>
          <p class="mt-2 text-neutral-400 text-sm">
            Sustainable charging solutions for electric vehicles
          </p>
        </div>
        
        <div class="grid grid-cols-2 md:grid-cols-3 gap-8">
          <div>
            <h3 class="text-sm font-semibold uppercase tracking-wider">Navigation</h3>
            <div class="mt-4 space-y-2">
              <router-link to="/" class="block text-neutral-400 hover:text-white">Home</router-link>
              <router-link to="/map" class="block text-neutral-400 hover:text-white">Map</router-link>
              <router-link to="/login" class="block text-neutral-400 hover:text-white">Login</router-link>
              <router-link to="/register" class="block text-neutral-400 hover:text-white">Register</router-link>
            </div>
          </div>
          
          <div>
            <h3 class="text-sm font-semibold uppercase tracking-wider">Legal</h3>
            <div class="mt-4 space-y-2">
              <a href="#" class="block text-neutral-400 hover:text-white">Privacy Policy</a>
              <a href="#" class="block text-neutral-400 hover:text-white">Terms of Service</a>
              <a href="#" class="block text-neutral-400 hover:text-white">Cookie Policy</a>
            </div>
          </div>
          
          <div class="col-span-2 md:col-span-1">
            <h3 class="text-sm font-semibold uppercase tracking-wider">Contact</h3>
            <div class="mt-4 space-y-2">
              <p class="block text-neutral-400">info@evchargehub.com</p>
              <p class="block text-neutral-400">+1 (555) 123-4567</p>
            </div>
          </div>
        </div>
      </div>
      
      <div class="mt-8 border-t border-neutral-700 pt-8 flex flex-col md:flex-row justify-between items-center">
        <p class="text-neutral-400 text-sm">
          &copy; {{ new Date().getFullYear() }} EV Charge Hub. All rights reserved.
        </p>
        <div class="mt-4 md:mt-0 flex space-x-6">
          <a href="#" class="text-neutral-400 hover:text-white">
            <span class="sr-only">Facebook</span>
            <svg class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path fill-rule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clip-rule="evenodd" />
            </svg>
          </a>
          <a href="#" class="text-neutral-400 hover:text-white">
            <span class="sr-only">Twitter</span>
            <svg class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
            </svg>
          </a>
          <a href="#" class="text-neutral-400 hover:text-white">
            <span class="sr-only">LinkedIn</span>
            <svg class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path fill-rule="evenodd" d="M4.98 3.5c0 1.381-1.11 2.5-2.48 2.5s-2.48-1.119-2.48-2.5c0-1.38 1.11-2.5 2.48-2.5s2.48 1.12 2.48 2.5zm.02 4.5h-5v16h5v-16zm7.982 0h-4.968v16h4.969v-8.399c0-4.67 6.029-5.052 6.029 0v8.399h4.988v-10.131c0-7.88-8.922-7.593-11.018-3.714v-2.155z" clip-rule="evenodd" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  </footer>
</template>