import { useEffect, useRef, useCallback, useState } from 'react';
import toast from 'react-hot-toast';

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:5000/ws';

export const useWebSocket = () => {
  const ws = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const reconnectTimeout = useRef(null);
  const reconnectAttempts = useRef(0);

  const connect = useCallback(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      ws.current = new WebSocket(`${WS_URL}?token=${token}`);

      ws.current.onopen = () => {
        setIsConnected(true);
        reconnectAttempts.current = 0;
        console.log('WebSocket connected');
      };

      ws.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          handleMessage(data);
        } catch (error) {
          console.error('WebSocket parse error:', error);
        }
      };

      ws.current.onclose = () => {
        setIsConnected(false);

        // Exponential backoff reconnection
        const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
        reconnectAttempts.current += 1;

        reconnectTimeout.current = setTimeout(() => {
          console.log('Reconnecting WebSocket...');
          connect();
        }, delay);
      };

      ws.current.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    } catch (error) {
      console.error('WebSocket connection failed:', error);
    }
  }, []);

  const handleMessage = (data) => {
    switch (data.type) {
      case 'CONNECTED':
        break;

      case 'NEW_NOTIFICATION':
      case 'GOAL_SUBMITTED':
      case 'GOAL_APPROVED':
      case 'GOAL_REJECTED':
      case 'CHECKIN_REMINDER':
      case 'ACHIEVEMENT_UPDATED':
        // Show toast notification
        const toastFn = data.variant === 'success' ? toast.success
          : data.variant === 'danger' ? toast.error
          : toast;

        toastFn(data.message || data.title, {
          duration: 5000,
          icon: data.variant === 'success' ? '🎉'
            : data.variant === 'danger' ? '❌'
            : '🔔'
        });

        // Add to notifications list
        setNotifications(prev => [{
          id: Date.now(),
          ...data,
          is_read: false,
          created_at: new Date().toISOString()
        }, ...prev].slice(0, 50));
        break;

      default:
        break;
    }
  };

  const sendMessage = useCallback((data) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(data));
    }
  }, []);

  const disconnect = useCallback(() => {
    if (reconnectTimeout.current) {
      clearTimeout(reconnectTimeout.current);
    }
    ws.current?.close();
    setIsConnected(false);
  }, []);

  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect, disconnect]);

  return {
    isConnected,
    notifications,
    sendMessage,
    setNotifications
  };
};