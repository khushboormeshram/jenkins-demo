import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

function GoogleOAuthTest() {
  const [status, setStatus] = useState('Initializing...');
  const [clientId, setClientId] = useState('');

  useEffect(() => {
    const clientIdFromEnv = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    setClientId(clientIdFromEnv || 'NOT SET');

    const checkGoogleLibrary = () => {
      if (window.google && window.google.accounts) {
        setStatus('✅ Google library loaded successfully');
        try {
          window.google.accounts.id.initialize({
            client_id: clientIdFromEnv,
            callback: (response) => {
              console.log('Test callback received:', response);
              setStatus('✅ Google OAuth working! Check console for token.');
            },
          });
          
          // Render the official Google button
          const buttonContainer = document.getElementById('google-test-button');
          if (buttonContainer) {
            window.google.accounts.id.renderButton(buttonContainer, {
              theme: 'outline',
              size: 'large',
              width: '100%',
              text: 'signin_with',
              shape: 'rectangular',
            });
            setStatus('✅ Google OAuth initialized and button rendered');
          }
        } catch (error) {
          setStatus('❌ Error initializing Google OAuth: ' + error.message);
        }
      } else {
        setStatus('❌ Google library not loaded');
      }
    };

    // Load Google library
    if (!window.google) {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        setTimeout(checkGoogleLibrary, 100);
      };
      script.onerror = () => {
        setStatus('❌ Failed to load Google library');
      };
      document.head.appendChild(script);
    } else {
      checkGoogleLibrary();
    }
  }, []);

  const testGoogleLogin = () => {
    if (window.google && window.google.accounts) {
      window.google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed()) {
          setStatus('❌ Google popup blocked or not displayed');
        } else if (notification.isSkippedMoment()) {
          setStatus('❌ Google popup skipped');
        }
      });
    } else {
      setStatus('❌ Google library not available');
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Google OAuth Debug</h2>
      
      <div className="space-y-3">
        <div>
          <strong>Client ID:</strong>
          <p className="text-sm font-mono bg-gray-100 p-2 rounded break-all">
            {clientId}
          </p>
        </div>
        
        <div>
          <strong>Status:</strong>
          <p className="text-sm">{status}</p>
        </div>
        
        <div>
          <strong>Official Google Button:</strong>
          <div id="google-test-button" className="mt-2"></div>
        </div>
        
        <Button onClick={testGoogleLogin} className="w-full" variant="outline">
          Test Popup Method (Fallback)
        </Button>
        
        <div className="text-xs text-gray-500">
          <p>Check the browser console for detailed logs.</p>
          <p>Make sure your domain is authorized in Google Cloud Console.</p>
          <p>The official Google button should appear above if everything is working.</p>
        </div>
      </div>
    </div>
  );
}

export default GoogleOAuthTest;