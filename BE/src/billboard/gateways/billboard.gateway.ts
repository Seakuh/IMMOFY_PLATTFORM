import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

export interface BillboardNotification {
  type: 'new_application' | 'application_status' | 'new_comment' | 'new_like' | 'invitation_received' | 'deadline_reminder';
  billboardId: string;
  userId: string;
  data: any;
  timestamp: Date;
}

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: '/billboard'
})
export class BillboardGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private userSockets: Map<string, string[]> = new Map(); // userId -> socketIds[]

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    // Remove socket from user mapping
    for (const [userId, socketIds] of this.userSockets.entries()) {
      const index = socketIds.indexOf(client.id);
      if (index > -1) {
        socketIds.splice(index, 1);
        if (socketIds.length === 0) {
          this.userSockets.delete(userId);
        }
        break;
      }
    }
  }

  @SubscribeMessage('join_user_channel')
  handleJoinUserChannel(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { userId: string }
  ) {
    const { userId } = data;

    if (!this.userSockets.has(userId)) {
      this.userSockets.set(userId, []);
    }

    this.userSockets.get(userId).push(client.id);
    client.join(`user_${userId}`);

    return { status: 'success', message: `Joined user channel: ${userId}` };
  }

  @SubscribeMessage('join_billboard')
  handleJoinBillboard(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { billboardId: string }
  ) {
    const { billboardId } = data;
    client.join(`billboard_${billboardId}`);

    return { status: 'success', message: `Joined billboard: ${billboardId}` };
  }

  @SubscribeMessage('leave_billboard')
  handleLeaveBillboard(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { billboardId: string }
  ) {
    const { billboardId } = data;
    client.leave(`billboard_${billboardId}`);

    return { status: 'success', message: `Left billboard: ${billboardId}` };
  }

  // Server-side methods to emit notifications

  /**
   * Notify billboard creator of new application
   */
  notifyNewApplication(creatorId: string, notification: BillboardNotification) {
    this.server.to(`user_${creatorId}`).emit('billboard:new_application', notification);
  }

  /**
   * Notify applicant of application status change
   */
  notifyApplicationStatus(applicantId: string, notification: BillboardNotification) {
    this.server.to(`user_${applicantId}`).emit('billboard:application_status', notification);
  }

  /**
   * Notify all billboard subscribers of new comment
   */
  notifyNewComment(billboardId: string, notification: BillboardNotification) {
    this.server.to(`billboard_${billboardId}`).emit('billboard:new_comment', notification);
  }

  /**
   * Notify all billboard subscribers of new like
   */
  notifyNewLike(billboardId: string, notification: BillboardNotification) {
    this.server.to(`billboard_${billboardId}`).emit('billboard:new_like', notification);
  }

  /**
   * Notify user of received invitation
   */
  notifyInvitationReceived(inviteeId: string, notification: BillboardNotification) {
    this.server.to(`user_${inviteeId}`).emit('billboard:invitation_received', notification);
  }

  /**
   * Notify billboard creator of approaching deadline
   */
  notifyDeadlineReminder(creatorId: string, notification: BillboardNotification) {
    this.server.to(`user_${creatorId}`).emit('billboard:deadline_reminder', notification);
  }

  /**
   * Get connected users count for a billboard
   */
  getBillboardViewersCount(billboardId: string): number {
    const room = this.server.sockets.adapter.rooms.get(`billboard_${billboardId}`);
    return room ? room.size : 0;
  }

  /**
   * Check if user is online
   */
  isUserOnline(userId: string): boolean {
    return this.userSockets.has(userId) && this.userSockets.get(userId).length > 0;
  }
}