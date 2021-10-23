# <b>Eyepatch</b>

![Eyepatch Room](https://github.com/mschien/eyepatch-client/blob/master/images/eyepatch1.png)
## Live Demo:
[https://mschien-eyepatch.surge.sh/](https://mschien-eyepatch.surge.sh/)

## User Flow:

- Creating an account / or signing in:
![Signup](https://github.com/mschien/eyepatch-client/blob/master/images/eyepatch6.png)
- Creating a room:
![Create Room](https://github.com/mschien/eyepatch-client/blob/master/images/eyepatch5.png)
- Joining a room:
![Rooms page](https://github.com/mschien/eyepatch-client/blob/master/images/eyepatch4.png)
- Adding search results to queue:
![Search](https://github.com/mschien/eyepatch-client/blob/master/images/eyepatch2.png)
- Playing videos in queue:
![Playing](https://github.com/mschien/eyepatch-client/blob/master/images/eyepatch3.png)

## Installation and Requirements

<b>You will need the backend and messaging server setup before running the client side code, you can find the corresponding repositories here:</b>
- [Backend server / database][1]
- [Messaging server][2]
- [Frontend code][3]

[1]: https://github.com/mschien/eyepatch-server
[2]: https://github.com/mschien/eyepatch-messaging
[3]: https://github.com/mschien/eyepatch-client

Execute the following command in an seperate terminal to install all the required modules.

```
npm i
```
Run the messaging server

```
npm run start
```


## <b>YouTube Player / Data API</b>

<b>Reference Docs for end points used in this app:</b>
- [Youtube Embed Player API][4]
- [Youtube Data API][5]


[4]: https://developers.google.com/youtube/iframe_api_reference
[5]: https://developers.google.com/youtube/v3


## <b>Built With</b>

- React

- Websockets

- Node.js

- Express.js

- PostgresQL

- Bootstrap
