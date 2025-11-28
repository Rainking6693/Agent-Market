'use client';

import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export interface TestRunProgress {
  runId: string;
  status: 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';
  currentTest?: string;
  completedTests: number;
  totalTests: number;
  score?: number;
  error?: string;
}

export function useTestRunProgress(runId: string | null) {
  const [progress, setProgress] = useState<TestRunProgress | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (!runId) {
      return;
    }

    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    const newSocket = io(`${API_BASE_URL}/test-runs`, {
      transports: ['websocket'],
    });

    newSocket.on('connect', () => {
      newSocket.emit('subscribe', { runId });
    });

    newSocket.on('test-run-progress', (data: TestRunProgress) => {
      if (data.runId === runId) {
        setProgress(data);
      }
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from test run updates');
    });

    setSocket(newSocket);

    return () => {
      if (newSocket) {
        newSocket.emit('unsubscribe', { runId });
        newSocket.disconnect();
      }
    };
  }, [runId]);

  return { progress, socket };
}

