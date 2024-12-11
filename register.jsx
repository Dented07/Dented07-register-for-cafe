import React, { useState, useCallback } from 'react';
import { Wifi, WifiOff, Delete, ArrowLeft } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const RegisterWithNumpad = () => {
  const [displayValue, setDisplayValue] = useState('0');
  const [isConnected, setIsConnected] = useState(false);
  const [registerId] = useState(() => 
    localStorage.getItem('registerId') || `register_${Date.now()}`
  );
  const [ws, setWs] = useState(null);

  const connectWebSocket = useCallback(() => {
    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = window.location.host;
      const socket = new WebSocket(`${protocol}//${host}/ws`);

      socket.onopen = () => {
        setIsConnected(true);
        socket.send(JSON.stringify({
          type: 'register_connect',
          registerId
        }));
      };

      socket.onclose = () => {
        setIsConnected(false);
        setTimeout(connectWebSocket, 3000);
      };

      setWs(socket);
      return socket;
    } catch (error) {
      console.error('WebSocket error:', error);
      setIsConnected(false);
    }
  }, [registerId]);

  React.useEffect(() => {
    const socket = connectWebSocket();
    return () => socket?.close();
  }, [connectWebSocket]);

  const updateDisplay = (newValue) => {
    setDisplayValue(newValue);
    const numericValue = parseFloat(newValue) || 0;
    if (ws?.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'update',
        registerId,
        total: numericValue
      }));
    }
  };

  const handleNumber = (num) => {
    if (displayValue === '0') {
      updateDisplay(num.toString());
    } else {
      updateDisplay(displayValue + num);
    }
  };

  const handleDecimal = () => {
    if (!displayValue.includes('.')) {
      updateDisplay(displayValue + '.');
    }
  };

  const handleBackspace = () => {
    if (displayValue.length > 1) {
      updateDisplay(displayValue.slice(0, -1));
    } else {
      updateDisplay('0');
    }
  };

  const handleClear = () => {
    updateDisplay('0');
  };

  return (
    <div className="h-screen w-screen bg-gray-100 p-4">
      <Card className="mx-auto max-w-md h-full flex flex-col">
        <CardContent className="flex-1 flex flex-col gap-6 p-6">
          <div className="flex justify-between items-center">
            <span className="text-lg font-bold">Register #{registerId.split('_')[1]}</span>
            {isConnected ? 
              <Wifi className="h-6 w-6 text-green-500" /> : 
              <WifiOff className="h-6 w-6 text-red-500" />
            }
          </div>

          <div className="bg-white rounded-lg p-4 text-right text-6xl font-mono h-24 flex items-center justify-end">
            ${displayValue}
          </div>

          <div className="grid grid-cols-3 gap-4">
            {[7, 8, 9, 4, 5, 6, 1, 2, 3].map((num) => (
              <Button
                key={num}
                onClick={() => handleNumber(num)}
                className="h-20 text-3xl"
              >
                {num}
              </Button>
            ))}
            <Button onClick={() => handleNumber(0)} className="h-20 text-3xl">
              0
            </Button>
            <Button onClick={handleDecimal} className="h-20 text-3xl">
              .
            </Button>
            <Button onClick={handleBackspace} className="h-20">
              <ArrowLeft className="h-8 w-8" />
            </Button>
          </div>

          <Button
            variant="destructive"
            onClick={handleClear}
            className="h-20 text-2xl"
          >
            CLEAR
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegisterWithNumpad;