const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

const PORT = 3000;

let rooms = {};

function eventsHandler(request, response, next) {
  const headers = {
    'Content-Type': 'text/event-stream',
    'Connection': 'keep-alive',
    'Cache-Control': 'no-cache'
  };

  response.writeHead(200, headers);

  const roomId = request.params.roomId;
  const clientId = request.params.clientId;

  
  const newClient = {
    id: clientId,
    response
  };

  
  if(!rooms[roomId]){
    rooms[roomId] = {};
    rooms[roomId][clientId] = newClient
    console.log('client connected:', clientId, 'in room:', roomId);
  }


  request.on('close', () => {
    console.log(`${clientId} Connection closed`);
    delete rooms[roomId][clientId]
  });
}

//curl -H Accept:text/event-stream http://localhost:3000/notifications/room1/akash
app.get('/notifications/:roomId/:clientId', eventsHandler);

function sendEventToClient(roomId, clientId, notification) {
  try {
    if(rooms[roomId]){
      if(rooms[roomId][clientId]){
        rooms[roomId][clientId].response.write(`data: ${JSON.stringify(notification)}\n\n`);
      } else {
        console.log("client not online in room");
      }
    } else {
      console.log('no such room exists!')
    }
  } catch (error) {
    console.log('client not connected', error);
  }
}

async function addNotification(request, respsonse, next) {
  const roomId = request.params.roomId;
  const clientId = request.params.clientId;
  const notification = request.body;
  respsonse.json(notification)
  return sendEventToClient(roomId, clientId, notification);
}


// curl -X POST \
//  -H "Content-Type: application/json" \
//  -d '{"text": "Shark teeth are embedded in the gums rather than directly affixed to the jaw, and are constantly replaced throughout life."}'\
//  -s http://localhost:3000/notifications/room1/akash

app.post('/notifications/:roomId/:clientId', addNotification);

app.listen(PORT, () => {
  console.log(`Notifications Events service listening at http://localhost:${PORT}`)
})
