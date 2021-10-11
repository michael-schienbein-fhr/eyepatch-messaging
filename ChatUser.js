/** Functionality related to chatting. */

// Room is an abstraction of a chat channel
const Room = require('./Room');

/** ChatUser is a individual connection from client -> server to chat. */

class ChatUser {
  /** make chat: store connection-device, rooom */

  constructor(send, roomId) {
    this._send = send; // "send" function for this user
    this.username = null; // becomes the username of the visitor
    this.room = Room.get(roomId); // room user will be in
    this.queue = Array.from(this.room.getVideos());
    this.members = Array.from(this.room.getMembers())
    this.currentVideoId = this.room.getCurrentVideoId();
    this.currentVideoTime = this.room.getCurrentVideoTime();
    console.log(`created chat in room: ${this.room.id}`);
  };

  /** send msgs to this client using underlying connection-send-function */

  send(data) {
    try {
      this._send(data);
    } catch {
      // If trying to send to a user fails, ignore it
    };
  };

  /** handle joining: add to room members, announce join */

  handleJoin(username) {
    this.username = username;
    // for (let member of this.members) {

    //   console.log(member)
    //   console.log(member.username)
    // }
    this.room.join(this);
    this.room.broadcast({
      type: 'note',
      text: `${this.username} joined "${this.room.id}".`,

    });
    for (let video of this.queue) {
      this.room.broadcastSelf({
        username: this.username,
        type: 'video',
        action: 'add',
        text: `"${video.title}" added to queue for user: "${this.username}".`,
        videoId: video.videoId,
        title: video.title,
        description: video.description,
        thumbnail: video.thumbnail
      });
    };
    // for (let member of this.members) {
    //   this.room.broadcastSelf({
    //     username: this.username,
    //     type: 'members',
    //     roomMember: member.username
    //   });
    // };
    this.room.broadcastSelf({
      username: this.username,
      type: 'video',
      action: 'change',
      text: `"Changed to ${this.currentVideoId}" in room: "${this.room.id}".`,
      videoId: this.currentVideoId,
    })
    this.room.broadcastSelf({
      username: this.username,
      type: 'video',
      action: 'sync',
      time: this.currentVideoTime,
      text: `"Synced video time" in room: "${this.room.id}".`,
    });

  };

  /** handle a chat: broadcast to room. */

  handleChat(text) {
    this.room.broadcast({
      username: this.username,
      type: 'chat',
      text: text
    });
  };

  handleVideo(video) {
    this.video = video;
    if (video.action === 'add') {
      this.room.add(this.video);
      this.room.broadcast({
        type: 'video',
        action: 'add',
        text: `"${this.video.title}" added to queue in room: "${this.room.id}".`,
        videoId: this.video.videoId,
        title: this.video.title,
        description: this.video.description,
        thumbnail: this.video.thumbnail
      });
    } else if (video.action === 'remove') {
      this.room.remove(this.video);
      this.room.broadcast({
        type: 'video',
        action: 'remove',
        text: `"${this.video.title}" removed from queue in room: "${this.room.id}".`,
        videoId: this.video.videoId,
        title: this.video.title,
        description: this.video.description,
        thumbnail: this.video.thumbnail
      });
    } else if (video.action === 'change') {
      this.room.setCurrentVideoId(this.video.videoId)
      this.room.broadcast({
        type: 'video',
        action: 'change',
        time: 0,
        text: `"Changed to ${this.video.videoId}" in room: "${this.room.id}".`,
        videoId: this.video.videoId,
      });
    }
  };

  handlePlayerState(msg) {
    // console.log(msg);
    // console.log(msg.time);
    console.log(this.playerIds)
    if (!this.currentVideoTime) {
      this.room.setCurrentVideoTime(msg.time);
    } else if (this.currentVideoTime < msg.time) {
      this.room.setCurrentVideoTime(msg.time);
    }
    if (msg.who === 'exclusive') {
      this.room.broadcastExclusive({
        username: this.username,
        type: 'playerState',
        who: 'exclusive',
        state: msg.state,
        time: msg.time,
        videoId: msg.videoId
      });
    }

    if (msg.who === 'everyone') {
      this.room.broadcast({
        username: this.username,
        type: 'playerState',
        who: 'everyone',
        state: msg.state,
        time: msg.time,
        videoId: msg.videoId
      });
    };

    if (msg.who === 'self') {
      this.room.broadcastSelf({
        username: this.username,
        type: 'playerState',
        who: 'self',
        state: msg.state,
        time: msg.time,
        videoId: msg.videoId
      });
    };
  };

  // handleUsernames(username){

  // }
  // handlePlayerId(id) {
  //   this.playerId = id
  //   this.room.addPlayerId(this.playerId);
    // this.room.broadcast({
    //   type: 'playerId',
    //   id: this.playerId
    // });
    // for (let id of this.playerIds) {
    //   this.room.broadcastSelf({
    //     username: this.username,
    //     type: 'video',
    //     action: 'add',
    //     text: `"${video.title}" added to queue for user: "${this.username}".`,
    //     videoId: video.videoId,
    //     title: video.title,
    //     description: video.description,
    //     thumbnail: video.thumbnail
    //   });
    // };
  // }
  /** Handle messages from client:
   *
   * - {type: "join", name: username} : join
   * - {type: "chat", text: msg }     : chat
   */

  handleMessage(jsonData) {
    let msg = JSON.parse(jsonData);
    console.log(msg)
    if (msg.type === 'join') this.handleJoin(msg.username);
    else if (msg.type === 'chat') this.handleChat(msg.text);
    else if (msg.type === 'playerState') {
      this.handlePlayerState(msg);
    }
    else if (msg.type === 'video') this.handleVideo(msg);
    // else if (msg.type === 'playerId') this.handlePlayerId(msg.id);
    // else if (msg.type === 'username') this.handlePlayerId(msg.id);
    else throw new Error(`bad message: ${msg.type}`);
  }

  /** Connection was closed: leave room, announce exit to others */

  handleClose() {
    this.room.leave(this);
    this.room.broadcast({
      type: 'note',
      text: `${this.username} left ${this.room.id}.`
    });
  }
}

module.exports = ChatUser;
