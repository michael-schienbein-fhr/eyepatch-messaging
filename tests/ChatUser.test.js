const {
  startServer,
  waitForSocketState,
  createSocketClient } = require("./webSocketTestUtils");
const request = require('superwstest');
const port = 3000 + Number(process.env.JEST_WORKER_ID);


describe('Messaging functionality', () => {
  let server;

  beforeEach(async () => {
    server = await startServer(port)
  });

  afterEach((done) => {
    server.close(done);
  });

  test('User can join a Room', async () => {
    await request(server)
      .ws('/path/ws/9')
      .sendJson({ type: "join", username: "testuser" })
      .expectJson({ type: "note", text: 'testuser joined "9".' })
      .close()
      .expectClosed();
  });

  test('Multiple users can join a room', async () => {
    const [client1, messages1] = await createSocketClient(port, 3, 1);
    const [client2, messages2] = await createSocketClient(port, 3, 1);

    const client1Message = { type: "join", username: "testuser1" };
    const client2Message = { type: "join", username: "testuser2" };

    client1.send(JSON.stringify(client1Message));
    client2.send(JSON.stringify(client2Message));

    await waitForSocketState(client1, client1.CLOSED);
    await waitForSocketState(client2, client2.CLOSED);

    expect(messages1[0]).toEqual({ type: "note", text: 'testuser1 joined "1".' });
    expect(messages2[0]).toEqual({ type: "note", text: 'testuser2 joined "1".' });

    client1.close()
    client2.close()
  })

  test('Snyc, Queue, and Video change handled on user join', async () => {
    await request(server)
      .ws('/path/ws/9')
      .sendJson({ type: "join", username: "testuser" })
      .expectJson({ type: 'note', text: 'testuser joined "9".' })
      .sendJson({
        type: 'video',
        action: 'add',
        videoId: "testVideoId",
        title: "testVideoTitle",
        description: "testDescription",
        thumbnail: "testThumbnail"
      })
      .sendJson({
        type: 'video',
        action: 'change',
        videoId: "testVideoTitle",
      })
      .sendJson({
        type: "playerState",
        state: "sync",
        time: 999
      })

    await request(server)
      .ws('/path/ws/9')
      .sendJson({ type: "join", username: "testuser2" })
      .wait(1000)
      .expectJson({ type: 'note', text: 'testuser2 joined "9".' })
      .expectJson({
        username: 'testuser2',
        type: 'playerState',
        state: 'sync',
        time: 999,
        playerState: null,
        text: '"Synced video time" in room: "9".'
      })
      .expectJson({
        username: 'testuser2',
        type: 'video',
        action: 'add',
        text: '"testVideoTitle" added to queue for user: "testuser2".',
        videoId: 'testVideoId',
        title: 'testVideoTitle',
        description: 'testDescription',
        thumbnail: 'testThumbnail'
      })
      .expectJson({
        username: 'testuser2',
        type: 'video',
        action: 'change',
        text: '"Changed to testVideoTitle" in room: "9".',
        videoId: 'testVideoTitle'
      })
      .close()
      .expectClosed()
  })

  test('Chat message to other user', async () => {
    const [client1, messages1] = await createSocketClient(port, 5, 9);
    const [client2, messages2] = await createSocketClient(port, 5, 9);

    const client1Message = { type: "join", username: "testuser1" };
    const client1Message2 = { type: "chat", text: "test message" };
    const client2Message = { type: "join", username: "testuser2" };

    client1.send(JSON.stringify(client1Message));
    client2.send(JSON.stringify(client2Message));
    setTimeout(() => client1.send(JSON.stringify(client1Message2)), 500)
    await waitForSocketState(client1, client1.CLOSED);
    await waitForSocketState(client2, client2.CLOSED);

    expect(messages1[0]).toEqual({ type: "note", text: 'testuser1 joined "9".' });
    expect(messages2[3]).toEqual({ username: 'testuser1', type: 'chat', text: 'test message' },);

    client1.close()
    client2.close()
  })

  test('Adding and removing from queue', async () => {
    const [client1, messages1] = await createSocketClient(port, 5, 9);
    const [client2, messages2] = await createSocketClient(port, 5, 9);

    const client1Message = { type: "join", username: "testuser1" };
    const client1Message2 = {
      type: 'video',
      action: 'add',
      videoId: 'testVideoId',
      title: 'testVideoTitle',
      description: 'testDescription',
      thumbnail: 'testThumbnail'
    };
    const client1Message3 = {
      type: 'video',
      action: 'remove',
      videoId: 'testVideoId'
    };
    const client2Message = { type: "join", username: "testuser2" };

    client1.send(JSON.stringify(client1Message));
    client2.send(JSON.stringify(client2Message));
    setTimeout(() => client1.send(JSON.stringify(client1Message2)), 500)
    setTimeout(() => client1.send(JSON.stringify(client1Message3)), 500)
    await waitForSocketState(client1, client1.CLOSED);
    await waitForSocketState(client2, client2.CLOSED);

    expect(messages1[0]).toEqual({ type: "note", text: 'testuser1 joined "9".' });
    expect(messages2[3]).toEqual({
      type: 'video',
      action: 'add',
      text: '"testVideoTitle" added to queue in room: "9".',
      videoId: 'testVideoId',
      title: 'testVideoTitle',
      description: 'testDescription',
      thumbnail: 'testThumbnail'
    });
    expect(messages2[4]).toEqual({
      type: 'video',
      action: 'remove',
      text: 'Video removed from queue in room: "9".',
      videoId: 'testVideoId'
    });
    client1.close()
    client2.close()
  })

  test('Adding and changing Video', async () => {
    const [client1, messages1] = await createSocketClient(port, 5, 9);
    const [client2, messages2] = await createSocketClient(port, 5, 9);

    const client1Message = { type: "join", username: "testuser1" };
    const client1Message2 = {
      type: 'video',
      action: 'add',
      videoId: 'testVideoId',
      title: 'testVideoTitle',
      description: 'testDescription',
      thumbnail: 'testThumbnail'
    };
    const client1Message3 = {
      type: 'video',
      action: 'change',
      videoId: 'testVideoId'
    };
    const client2Message = { type: "join", username: "testuser2" };

    client1.send(JSON.stringify(client1Message));
    client2.send(JSON.stringify(client2Message));
    setTimeout(() => client1.send(JSON.stringify(client1Message2)), 500)
    setTimeout(() => client1.send(JSON.stringify(client1Message3)), 500)
    await waitForSocketState(client1, client1.CLOSED);
    await waitForSocketState(client2, client2.CLOSED);

    expect(messages1[0]).toEqual({ type: "note", text: 'testuser1 joined "9".' });
    expect(messages2[3]).toEqual({
      type: 'video',
      action: 'add',
      text: '"testVideoTitle" added to queue in room: "9".',
      videoId: 'testVideoId',
      title: 'testVideoTitle',
      description: 'testDescription',
      thumbnail: 'testThumbnail'
    });
    expect(messages2[4]).toEqual({
      type: 'video',
      action: 'change',
      time: 0,
      text: '"Changed to testVideoId" in room: "9".',
      videoId: 'testVideoId'
    });
    client1.close()
    client2.close()
  })

  test('Set CurrentVideoTime and CurrentVideoState', async () => {
    await request(server)
      .ws('/path/ws/9')
      .sendJson({ type: "join", username: "testuser" })
      .expectJson({ type: 'note', text: 'testuser joined "9".' })
      .sendJson({
        type: "playerState",
        who: 'exclusive',
        state: "play",
        time: 999,
        videoId: "testVideoId"
      })
      .sendJson({
        type: "playerState",
        who: 'exclusive',
        state: "play",
        time: 9999,
        videoId: "testVideoId"
      })

    await request(server)
      .ws('/path/ws/9')
      .sendJson({ type: "join", username: "testuser2" })
      .wait(1000)
      .expectJson({ type: 'note', text: 'testuser2 joined "9".' })
      .expectJson({
        username: 'testuser2',
        type: 'playerState',
        state: 'sync',
        time: 9999,
        playerState: "play",
        text: '"Synced video time" in room: "9".'
      })
      .close()
      .expectClosed()
  })

  test('Broadcast playerState everyone', async () => {
    const [client1, messages1] = await createSocketClient(port, 5, 9);
    const [client2, messages2] = await createSocketClient(port, 5, 9);

    const client1Message = { type: "join", username: "testuser1" };
    const client1Message2 = {
      type: "playerState",
      who: 'everyone',
      state: "play",
      time: 999,
      videoId: "testVideoIdSentToEveryone"
    };
    const client2Message = { type: "join", username: "testuser2" };

    client1.send(JSON.stringify(client1Message));
    client2.send(JSON.stringify(client2Message));
    setTimeout(() => client1.send(JSON.stringify(client1Message2)), 500)
    await waitForSocketState(client1, client1.CLOSED);
    await waitForSocketState(client2, client2.CLOSED);

    console.log(messages2)
    expect(messages1[0]).toEqual({ type: "note", text: 'testuser1 joined "9".' });
    expect(messages2[3]).toEqual({
      username: "testuser1",
      type: "playerState",
      who: 'everyone',
      state: "play",
      time: 999,
      videoId: "testVideoIdSentToEveryone"
    });

    client1.close()
    client2.close()
  })

  test('Broadcast playerState self', async () => {
    await request(server)
      .ws('/path/ws/9')
      .sendJson({ type: "join", username: "testuser" })
      .expectJson({ type: 'note', text: 'testuser joined "9".' })
      .sendJson({
        type: "playerState",
        who: 'self',
        state: "play",
        time: 999,
        videoId: "testVideoIdSentToSelf"
      })
      .expectJson()
      .expectJson()
      .expectJson({
        username: 'testuser',
        type: 'playerState',
        who: 'self',
        state: 'play',
        time: 999,
        videoId: 'testVideoIdSentToSelf'
      });

  })

  test('Handle close', async () => {
    const [client1, messages1] = await createSocketClient(port, 5, 9);
    const [client2, messages2] = await createSocketClient(port, 5, 9);

    const client1Message = { type: "join", username: "testuser1" };
    const client1Message2 = { type: "close" };
    const client2Message = { type: "join", username: "testuser2" };

    client1.send(JSON.stringify(client1Message));
    client2.send(JSON.stringify(client2Message));
    setTimeout(() => client1.send(JSON.stringify(client1Message2)), 500)
    await waitForSocketState(client1, client1.CLOSED);
    await waitForSocketState(client2, client2.CLOSED);

    expect(messages1[0]).toEqual({ type: "note", text: 'testuser1 joined "9".' });
    expect(messages2[3]).toEqual({ "text": "testuser1 left 9.", "type": "note" });

    client1.close()
    client2.close()


  });

});
