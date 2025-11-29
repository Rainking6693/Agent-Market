import { Logger } from '@nestjs/common';
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import Redis from 'ioredis';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: process.env.WEB_URL || 'http://localhost:3000',
    credentials: true,
  },
  namespace: '/test-runs',
})
export class TestRunsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(TestRunsGateway.name);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private redis: any;
  private subscribers: Map<string, Set<string>> = new Map(); // runId -> Set of socket IDs

  constructor() {
    // Initialize Redis subscriber
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.redis = new (Redis as any)({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
      password: process.env.REDIS_PASSWORD,
    });

    // Subscribe to all test-run channels
    this.redis.psubscribe('test-run:*');

    this.redis.on('pmessage', (pattern, channel, message) => {
      const runId = channel.replace('test-run:', '');
      const progress = JSON.parse(message);

      // Emit to all sockets subscribed to this run
      const socketIds = this.subscribers.get(runId);
      if (socketIds) {
        socketIds.forEach((socketId) => {
          this.server.to(socketId).emit('test-run-progress', progress);
        });
      }
    });
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);

    // Remove from all subscriptions
    for (const [runId, socketIds] of this.subscribers.entries()) {
      socketIds.delete(client.id);
      if (socketIds.size === 0) {
        this.subscribers.delete(runId);
      }
    }
  }

  @SubscribeMessage('subscribe')
  handleSubscribe(client: Socket, payload: { runId: string }) {
    const { runId } = payload;

    if (!this.subscribers.has(runId)) {
      this.subscribers.set(runId, new Set());
    }

    this.subscribers.get(runId)!.add(client.id);
    client.join(`test-run:${runId}`);

    this.logger.log(`Client ${client.id} subscribed to test run ${runId}`);
  }

  @SubscribeMessage('unsubscribe')
  handleUnsubscribe(client: Socket, payload: { runId: string }) {
    const { runId } = payload;

    const socketIds = this.subscribers.get(runId);
    if (socketIds) {
      socketIds.delete(client.id);
      if (socketIds.size === 0) {
        this.subscribers.delete(runId);
      }
    }

    client.leave(`test-run:${runId}`);
    this.logger.log(`Client ${client.id} unsubscribed from test run ${runId}`);
  }
}

