/* ============================================================================
   Farghar WordPress Academy - Native App Feel Enhancements
   Copyright (c) Farghar - All Rights Reserved.
   ----------------------------------------------------------------------------
   Features:
     - Install prompt for PWA
     - Pull-to-refresh gesture
     - Swipe navigation gestures
     - Bottom sheet modals
     - Haptic feedback simulation
     - Online/offline detection
   ============================================================================ */

(function(){
  'use strict';
  
  // ==========================================================================
  // INSTALL PROMPT
  // ==========================================================================
  let deferredPrompt = null;
  
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    showInstallPrompt();
  });
  
  window.addEventListener('appinstalled', () => {
    console.log('[PWA] App installed successfully');
    hideInstallPrompt();
    deferredPrompt = null;
  });
  
  function showInstallPrompt(){
    const existing = document.querySelector('.farghar-install-prompt');
    if (existing) return;
    
    const prompt = document.createElement('div');
    prompt.className = 'farghar-install-prompt';
    prompt.innerHTML = `
      <div class="farghar-install-prompt-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 2v20M2 12l10-10 10 10"/></svg>
      </div>
      <div class="farghar-install-prompt-text">نصب برنامه برای دسترسی سریع‌تر</div>
      <div class="farghar-install-prompt-actions">
        <button class="farghar-install-prompt-dismiss">بعداً</button>
        <button class="farghar-install-prompt-install">نصب</button>
      </div>
    `;
    
    document.body.appendChild(prompt);
    
    setTimeout(() => prompt.classList.add('visible'), 100);
    
    prompt.querySelector('.farghar-install-prompt-dismiss').addEventListener('click', () => {
      hideInstallPrompt();
      localStorage.setItem('farghar_install_dismissed', Date.now().toString());
    });
    
    prompt.querySelector('.farghar-install-prompt-install').addEventListener('click', async () => {
      if (!deferredPrompt) return;
      
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('[PWA] User accepted install prompt');
      }
      
      hideInstallPrompt();
      deferredPrompt = null;
    });
  }
  
  function hideInstallPrompt(){
    const prompt = document.querySelector('.farghar-install-prompt');
    if (prompt) {
      prompt.classList.remove('visible');
      setTimeout(() => prompt.remove(), 400);
    }
  }
  
  // Check if install was previously dismissed
  const dismissedAt = localStorage.getItem('farghar_install_dismissed');
  if (dismissedAt && Date.now() - parseInt(dismissedAt) < 7 * 24 * 60 * 60 * 1000) {
    // Don't show prompt for 7 days
  } else if (!dismissedAt || Date.now() - parseInt(dismissedAt) > 7 * 24 * 60 * 60 * 1000) {
    // Show after a delay
    setTimeout(() => {
      if ('serviceWorker' in navigator && !window.matchMedia('(display-mode: standalone)').matches) {
        // Only show if not already installed
      }
    }, 5000);
  }
  
  // ==========================================================================
  // PULL TO REFRESH
  // ==========================================================================
  let touchStartY = 0;
  let touchCurrentY = 0;
  let isPulling = false;
  const pullThreshold = 80;
  
  document.addEventListener('touchstart', (e) => {
    if (window.scrollY === 0) {
      touchStartY = e.touches[0].clientY;
      isPulling = true;
    }
  }, { passive: true });
  
  document.addEventListener('touchmove', (e) => {
    if (!isPulling) return;
    
    touchCurrentY = e.touches[0].clientY;
    const diff = touchCurrentY - touchStartY;
    
    if (diff > 0 && diff < pullThreshold * 2) {
      let indicator = document.querySelector('.farghar-pull-indicator');
      if (!indicator) {
        indicator = document.createElement('div');
        indicator.className = 'farghar-pull-indicator';
        indicator.innerHTML = '<span>در حال بارگذاری...</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>';
        document.body.appendChild(indicator);
      }
      
      const height = Math.min(diff, 44);
      indicator.style.height = height + 'px';
      
      if (height >= 44) {
        indicator.classList.add('visible');
      }
    }
  }, { passive: true });
  
  document.addEventListener('touchend', () => {
    if (!isPulling) return;
    isPulling = false;
    
    const indicator = document.querySelector('.farghar-pull-indicator');
    if (indicator && indicator.classList.contains('visible')) {
      // Trigger refresh
      indicator.innerHTML = '<span>بارگذاری شد!</span>';
      setTimeout(() => {
        indicator.classList.remove('visible');
        indicator.style.height = '0';
        setTimeout(() => indicator.remove(), 300);
        
        // Reload page
        window.location.reload();
      }, 800);
    } else if (indicator) {
      indicator.classList.remove('visible');
      indicator.style.height = '0';
      setTimeout(() => indicator.remove(), 300);
    }
    
    touchStartY = 0;
    touchCurrentY = 0;
  });
  
  // ==========================================================================
  // SWIPE GESTURES FOR NAVIGATION
  // ==========================================================================
  let swipeStartX = 0;
  let swipeStartY = 0;
  
  document.addEventListener('touchstart', (e) => {
    swipeStartX = e.touches[0].clientX;
    swipeStartY = e.touches[0].clientY;
  }, { passive: true });
  
  document.addEventListener('touchend', (e) => {
    const swipeEndX = e.changedTouches[0].clientX;
    const swipeEndY = e.changedTouches[0].clientY;
    const diffX = swipeEndX - swipeStartX;
    const diffY = swipeEndY - swipeStartY;
    
    // Horizontal swipe (left/right)
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
      if (diffX < 0) {
        // Swipe left - could navigate to next section
        console.log('[Gesture] Swipe left detected');
      } else {
        // Swipe right - go back
        console.log('[Gesture] Swipe right detected');
      }
    }
  });
  
  // ==========================================================================
  // BOTTOM SHEET MODALS (for mobile)
  // ==========================================================================
  function convertToBottomSheet(modalId){
    const modal = document.getElementById(modalId);
    if (!modal) return;
    
    // Apply bottom sheet style on mobile devices
    if (window.innerWidth <= 560) {
      modal.classList.add('farghar-modal-sheet');
    } else {
      modal.classList.remove('farghar-modal-sheet');
    }
    
    // Set initial aria-hidden state
    if (!modal.classList.contains('open')) {
      modal.setAttribute('aria-hidden', 'true');
    }
  }
  
  // Apply to existing modals
  ['fargharModal', 'fargharClockListModal'].forEach(id => {
    convertToBottomSheet(id);
  });
  
  window.addEventListener('resize', () => {
    ['fargharModal', 'fargharClockListModal'].forEach(id => {
      convertToBottomSheet(id);
    });
  });
  
  // ==========================================================================
  // HAPTIC FEEDBACK SIMULATION
  // ==========================================================================
  function hapticFeedback(pattern = [10]) {
    if (navigator.vibrate) {
      navigator.vibrate(pattern);
    }
  }
  
  // Add haptic feedback to interactive elements
  document.querySelectorAll('.farghar-btn, .farghar-clock-hour, .farghar-clock-list-item').forEach(el => {
    el.addEventListener('touchstart', () => {
      hapticFeedback([5]);
    });
  });
  
  // ==========================================================================
  // ONLINE/OFFLINE DETECTION
  // ==========================================================================
  function updateOnlineStatus() {
    const toast = document.getElementById('fargharToast');
    if (!toast) return;
    
    if (navigator.onLine) {
      toast.textContent = 'اتصال اینترنت برقرار شد';
      toast.style.background = '#0f8a44';
    } else {
      toast.textContent = 'شما آفلاین هستید - نسخه کش شده نمایش داده می‌شود';
      toast.style.background = '#a15c00';
    }
    
    toast.classList.add('visible');
    setTimeout(() => toast.classList.remove('visible'), 3000);
  }
  
  window.addEventListener('online', updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);
  
  // ==========================================================================
  // SAFE AREA HANDLING
  // ==========================================================================
  function handleSafeArea() {
    // Already handled in CSS with env() variables
    // This is for JS-based adjustments if needed
  }
  
  handleSafeArea();
  
  // ==========================================================================
  // PERFORMANCE OPTIMIZATIONS
  // ==========================================================================
  // Lazy load images and heavy content
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            observer.unobserve(img);
          }
        }
      });
    });
    
    document.querySelectorAll('img[data-src]').forEach(img => observer.observe(img));
  }
  
  // ==========================================================================
  // CONSOLE BRANDING
  // ==========================================================================
  console.log('%cوردپرس آکادمی فارغار', 'font-size: 20px; font-weight: bold; color: #3858e9');
  console.log('%cنسخه PWA با قابلیت نصب و کارکرد آفلاین', 'font-size: 12px; color: #666');
  
})();
