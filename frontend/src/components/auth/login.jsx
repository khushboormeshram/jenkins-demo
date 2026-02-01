import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Logo } from "@/components/auth/logo";
import { ArrowLeft, GraduationCap, Users } from "lucide-react";
import { DarkLightToggle } from "@/components/effects/darklight-toggle";

import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import authService from "@/services/auth.service";

const formSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Password is required"),
});

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [googleCredential, setGoogleCredential] = useState(null);
  const [googleUserData, setGoogleUserData] = useState(null);

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    resolver: zodResolver(formSchema),
  });

  // Initialize Google Sign-In
  useEffect(() => {
    const initializeGoogleSignIn = () => {
      console.log('Initializing Google Sign-In...');
      console.log('Client ID:', import.meta.env.VITE_GOOGLE_CLIENT_ID);
      
      if (window.google && window.google.accounts) {
        try {
          window.google.accounts.id.initialize({
            client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
            callback: handleGoogleResponse,
            auto_select: false,
            cancel_on_tap_outside: true,
            use_fedcm_for_prompt: false,
          });
          console.log('Google Sign-In initialized successfully');
        } catch (error) {
          console.error('Error initializing Google Sign-In:', error);
        }
      } else {
        console.error('Google Sign-In library not loaded');
      }
    };

    if (!window.google) {
      console.log('Loading Google Sign-In script...');
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        console.log('Google Sign-In script loaded');
        setTimeout(initializeGoogleSignIn, 100);
      };
      script.onerror = (error) => {
        console.error('Failed to load Google Sign-In script:', error);
      };
      document.head.appendChild(script);
    } else {
      initializeGoogleSignIn();
    }
  }, []);

  const handleGoogleResponse = async (response) => {
    console.log('Google response received:', response);
    setIsGoogleLoading(true);
    
    try {
      const tokenPayload = JSON.parse(atob(response.credential.split('.')[1]));
      console.log('Google token payload:', tokenPayload);
      
      const result = await authService.googleLogin(response.credential);
      console.log('Backend response:', result);
      
      if (result.success) {
        toast.success("Google login successful!");
        const user = result.data.user;
        console.log('Existing user data:', user);
        
        if (user && (user.role === 'teacher' || user.role === 'admin')) {
          navigate("/teacher/dashboard");
        } else {
          navigate("/practice");
        }
        window.location.reload();
      } else if (result.message && result.message.includes('not found')) {
        console.log('New user detected, showing role selection...');
        setGoogleCredential(response.credential);
        setGoogleUserData({
          name: tokenPayload.name,
          email: tokenPayload.email,
          picture: tokenPayload.picture
        });
        setShowRoleDialog(true);
      } else {
        console.error('Backend login failed:', result);
        toast.error(result.message || "Google login failed. Please try again.");
      }
    } catch (error) {
      console.error('Google login error:', error);
      toast.error("Google login failed. Please try again.");
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleRoleSelection = async (selectedRole) => {
    setIsGoogleLoading(true);
    try {
      console.log('Creating user with role:', selectedRole);
      
      const result = await authService.googleLoginWithRole(googleCredential, selectedRole);
      console.log('Backend response with role:', result);
      
      if (result.success) {
        toast.success(`Welcome! Account created as ${selectedRole}.`);
        const user = result.data.user;
        console.log('New user created:', user);
        
        setShowRoleDialog(false);
        
        if (selectedRole === 'teacher') {
          navigate("/teacher/dashboard");
        } else {
          navigate("/practice");
        }
        window.location.reload();
      } else {
        console.error('Backend signup failed:', result);
        toast.error(result.message || "Account creation failed. Please try again.");
      }
    } catch (error) {
      console.error('Role selection error:', error);
      toast.error("Account creation failed. Please try again.");
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    console.log('Google login button clicked');
    setIsGoogleLoading(true);
    
    if (window.google && window.google.accounts && window.google.accounts.id) {
      try {
        console.log('Creating temporary Google button...');
        
        const tempContainer = document.createElement('div');
        tempContainer.style.position = 'absolute';
        tempContainer.style.top = '-9999px';
        tempContainer.style.left = '-9999px';
        document.body.appendChild(tempContainer);
        
        window.google.accounts.id.renderButton(tempContainer, {
          theme: 'outline',
          size: 'large',
          type: 'standard',
          text: 'signin_with',
          shape: 'rectangular',
          click_listener: () => {
            console.log('Google button clicked programmatically');
          }
        });
        
        setTimeout(() => {
          const googleButton = tempContainer.querySelector('[role="button"]');
          if (googleButton) {
            console.log('Clicking Google button programmatically...');
            googleButton.click();
          } else {
            console.log('Google button not found, falling back to prompt...');
            window.google.accounts.id.prompt();
          }
          
          setTimeout(() => {
            if (document.body.contains(tempContainer)) {
              document.body.removeChild(tempContainer);
            }
            setIsGoogleLoading(false);
          }, 1000);
        }, 100);
        
      } catch (error) {
        console.error('Error with Google Sign-In:', error);
        toast.error("Google Sign-In failed to start. Please try again.");
        setIsGoogleLoading(false);
      }
    } else {
      console.error('Google Sign-In not available');
      toast.error("Google Sign-In is not available. Please try again later.");
      setIsGoogleLoading(false);
    }
  };

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const result = await login(data);
      if (result.success) {
        toast.success("Login successful!");
        const userStr = localStorage.getItem('user');
        const user = userStr ? JSON.parse(userStr) : null;
        if (user && (user.role === 'teacher' || user.role === 'admin')) {
          navigate("/teacher/dashboard");
        } else {
          navigate("/practice");
        }
      } else {
        toast.error(result.message || "Login failed. Please check your credentials.");
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Role Selection Dialog */}
      <Dialog open={showRoleDialog} onOpenChange={setShowRoleDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">Welcome to Code-E-Pariksha!</DialogTitle>
            <DialogDescription className="text-center">
              {googleUserData && (
                <div className="flex flex-col items-center gap-3 mt-4">
                  <img 
                    src={googleUserData.picture} 
                    alt={googleUserData.name}
                    className="w-16 h-16 rounded-full"
                  />
                  <div>
                    <p className="font-medium">{googleUserData.name}</p>
                    <p className="text-sm text-muted-foreground">{googleUserData.email}</p>
                  </div>
                </div>
              )}
              <p className="mt-4">Please select your role to continue:</p>
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 gap-4 mt-6">
            <Button
              onClick={() => handleRoleSelection('student')}
              disabled={isGoogleLoading}
              variant="outline"
              className="h-auto p-6 flex flex-col items-center gap-3 hover:bg-primary/5 hover:border-primary"
            >
              <GraduationCap className="w-8 h-8 text-primary" />
              <div className="text-center">
                <p className="font-medium">I'm a Student</p>
                <p className="text-sm text-muted-foreground">Practice coding and take assessments</p>
              </div>
            </Button>
            
            <Button
              onClick={() => handleRoleSelection('teacher')}
              disabled={isGoogleLoading}
              variant="outline"
              className="h-auto p-6 flex flex-col items-center gap-3 hover:bg-primary/5 hover:border-primary"
            >
              <Users className="w-8 h-8 text-primary" />
              <div className="text-center">
                <p className="font-medium">I'm a Teacher</p>
                <p className="text-sm text-muted-foreground">Create questions and manage classes</p>
              </div>
            </Button>
          </div>
          
          {isGoogleLoading && (
            <div className="flex items-center justify-center mt-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              <span className="ml-2 text-sm">Creating your account...</span>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <div className="h-screen flex items-center justify-center relative">
        <div className="absolute top-4 left-4 z-20">
          <DarkLightToggle />
        </div>
        <div className="w-full h-full grid lg:grid-cols-2 p-4">
          <div className="max-w-xs m-auto w-full flex flex-col items-center">
            <Link to="/" className="mb-5 self-start flex items-center gap-2 px-3 py-1.5 rounded-md bg-background/80 text-sm font-medium shadow hover:bg-background">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
            <Logo className="h-9 w-9" />

            <p className="mt-4 text-xl font-semibold tracking-tight">
              Log in to Code-E-Pariksha
            </p>

            <Button 
              className="mt-8 w-full gap-3"
              onClick={handleGoogleLogin}
              disabled={isGoogleLoading}
            >
              <GoogleLogo />
              {isGoogleLoading ? "Signing in..." : "Continue with Google"}
            </Button>

            <div className="my-7 w-full flex items-center justify-center overflow-hidden">
              <Separator />
              <span className="text-sm px-2">OR</span>
              <Separator />
            </div>

            <Form {...form}>
              <form
                className="w-full space-y-4"
                onSubmit={form.handleSubmit(onSubmit)}
              >
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="Email"
                          className="w-full"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Password"
                          className="w-full"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="mt-4 w-full" disabled={isLoading}>
                  {isLoading ? "Logging in..." : "Continue with Email"}
                </Button>
              </form>
            </Form>

            <div className="mt-5 space-y-5">
              <Link
                to="/forgot-password"
                className="text-sm block underline text-muted-foreground text-center"
              >
                Forgot your password?
              </Link>

              <p className="text-sm text-center">
                Don&apos;t have an account?
                <Link to="/signup" className="ml-1 underline text-muted-foreground">
                  Create account
                </Link>
              </p>
            </div>
          </div>

          <div className="bg-muted hidden lg:block rounded-lg border relative overflow-hidden min-h-[400px] flex items-center justify-center">
            <div className="absolute right-0 top-1/2 -translate-y-1/2 z-0 w-full max-w-[250px] xl:max-w-[400px] pointer-events-none select-none">
              <img alt="grid" src="/assets/grid-01.svg" className="w-full object-contain" loading="lazy" />
            </div>
            <div className="absolute left-0 top-1/2 -translate-y-1/2 z-0 w-full max-w-[250px] rotate-180 xl:max-w-[400px] pointer-events-none select-none">
              <img alt="grid" src="/assets/grid-01.svg" className="w-full object-contain" loading="lazy" />
            </div>
            <div className="absolute inset-0 flex flex-col items-center justify-center z-10 gap-4 px-8">
              <Logo className="h-12 w-12" />
              <h2 className="text-3xl font-bold tracking-tight text-center">Code-E-Pariksha</h2>
              <p className="text-muted-foreground text-center max-w-md">Master coding through practice and assessments</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function GoogleLogo() {
  return (
    <svg
      width="1.2em"
      height="1.2em"
      id="icon-google"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="inline-block shrink-0 align-sub text-inherit size-lg"
    >
      <g clipPath="url(#clip0)">
        <path
          d="M15.6823 8.18368C15.6823 7.63986 15.6382 7.0931 15.5442 6.55811H7.99829V9.63876H12.3194C12.1401 10.6323 11.564 11.5113 10.7203 12.0698V14.0687H13.2983C14.8122 12.6753 15.6823 10.6176 15.6823 8.18368Z"
          fill="#4285F4"
        />
        <path
          d="M7.99812 16C10.1558 16 11.9753 15.2915 13.3011 14.0687L10.7231 12.0698C10.0058 12.5578 9.07988 12.8341 8.00106 12.8341C5.91398 12.8341 4.14436 11.426 3.50942 9.53296H0.849121V11.5936C2.2072 14.295 4.97332 16 7.99812 16Z"
          fill="#34A853"
        />
        <path
          d="M3.50665 9.53295C3.17154 8.53938 3.17154 7.4635 3.50665 6.46993V4.4093H0.849292C-0.285376 6.66982 -0.285376 9.33306 0.849292 11.5936L3.50665 9.53295Z"
          fill="#FBBC04"
        />
        <path
          d="M7.99812 3.16589C9.13867 3.14825 10.241 3.57743 11.067 4.36523L13.3511 2.0812C11.9048 0.723121 9.98526 -0.0235266 7.99812 -1.02057e-05C4.97332 -1.02057e-05 2.2072 1.70493 0.849121 4.40932L3.50648 6.46995C4.13848 4.57394 5.91104 3.16589 7.99812 3.16589Z"
          fill="#EA4335"
        />
      </g>
      <defs>
        <clipPath id="clip0">
          <rect width="15.6825" height="16" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
}

export default Login;