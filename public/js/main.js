'use strict';

//Defining some global utility variables
var isChannelReady = false;
var isInitiator = false;
var isStarted = false;
var localStream;
var pc;
var remoteStream;
var turnReady;

//Initialize turn/stun server here
var pcConfig = turnConfig;

var localStreamConstraints = {
    audio: true,
    video: true
  };


//Not prompting for room name
//var room = 'foo';

// Prompting for room name:
var room = prompt('Enter room name:');
//var password = prompt('Enter your password:');
//Initializing socket.io
var socket = io.connect();

if (room !== '') {
  socket.emit('create or join', room);
  console.log('Attempted to create or  join room', room);
}

/* 채팅창 구현 */ 

socket.on('connect', function() {
  //이름 입력(추후 제작)
  //이름이 빈칸인 경우 
  var userName;
  console.log(userName);
  if(!userName) {
    userName = '익명';
  }
  // 서버에 새로운 유저가 왔다고 알림 
  socket.emit('newUser', userName)
})

// 서버로부터 데이터 받은 경우 
socket.on('update', function(data) {

  var message = $('.messages-you').last().clone();
  message.find('strong').text(data.otherName);
  message.find('p').text(data.message);
  //$('#input-me').val('');
  message.appendTo('.messages-list');
  message.find('.minutes').text("0");

})

socket.on('imageupdate', function (data) {
  //이미지 전송
  var output = '';
  output+='<li class="messages-you clearfix">'
  output+='<span class="message-img img-circle">'
  output+='<img src="https://demo.bootstrap.news/bootnews/assets/img/avatar/avatar2.png" alt="User Avatar" class="avatar-sm border rounded-circle">'
  output+='</span>'
  output+=' <div class="message-body clearfix">'
  output+= '<div class="message-header">'
  output+= '<strong class="messages-title" id="otherUser">'+'server'+'</strong>'
  output+= '</div>'
  output += '<li>'
  output+= '<img src =' + data.message + ' height = 200px width = 200px>'
  output += '</li>'
  output+= '</div>'
  output += '</li>';
  // 이때 이미지가 깨지는 이유: 127.0.0.1:52273 + data.message로 접속된다.
  // s3를 사용해서 s3주소를 날라오게 하면 가능하다. 
  
  $(output).appendTo('.messages-list');
  //$('.messages-list').listview('refresh');
});

socket.on('image', function (data) {
  //이미지 전송
  var output = '';
  output+='<li class="messages-me clearfix">'
  output+='<span class="message-img">'
  output+='<img src="https://demo.bootstrap.news/bootnews/assets/img/avatar/avatar1.png" alt="User Avatar" class="avatar-sm border rounded-circle">'
  output+='</span>'
  output+=' <div class="message-body clearfix">'
  output+= '<div class="message-header">'
  output+= '<strong class="messages-title" id="otherUser">server</strong>'
  output+= '</div>'
  output += '<li>'
  output+= '<img src =' + data.message + ' height = 200px width = 200px>'
  output += '</li>'
  output+= '</div>'
  output += '</li>';
  
  $(output).appendTo('.messages-list');
  //$('.messages-list').listview('refresh');
});



$('#send-message').on('submit', function (event) {
  //send 버튼을 눌렀을 때 이벤트 발생해서 자동실행되는 함수
  event.preventDefault();
  var textvalue = document.getElementById('input-me').value
  var message = $('.messages-me').last().clone();
  message.find('p').text($('#input-me').val());
  $('#input-me').val('');
  message.appendTo('.messages-list');
  message.find('.minutes').text("0");
  socket.emit('chat message', {type: 'chat message', message: textvalue})
});

$(function(){
  $('#uploadBtn').on('click', function(){
    uploadFile();
  });
});

function uploadFile(){
  var form = $('#uploadForm')[0];
  var formData = new FormData();
  formData.append("image", $("input[name=test]")[0].files[0]);
  var obj = {formData}
  $.ajax({
    url : '/image',
    type : 'POST',
    method: "POST",
    timeout: 0,
    processData: false,
    mimeType: "multipart/form-data",
    contentType: false,
    data: formData,
   
    success: function (data) {
      socket.emit('image', {
        //name: $('#name').val(),
        message: data,
        date: new Date().toUTCString()
      });
      alert("complete");
      $("#btnSubmit").prop("disabled", false);
    },
    error: function (e) {
      //console.log("ERROR : ", e);
      $("#btnSubmit").prop("disabled", false);
      alert("fail");
    }
  }).done(function(data){
    callback(data);
  });
  $.submit();

}


//Defining socket connections for signalling
socket.on('created', function(room) {
  console.log('Created room ' + room);
  isInitiator = true;
});

socket.on('full', function(room) {
  console.log('Room ' + room + ' is full');
});

socket.on('join', function (room){
  console.log('Another peer made a request to join room ' + room);
  console.log('This peer is the initiator of room ' + room + '!');
  isChannelReady = true;
});

socket.on('joined', function(room) {
  console.log('joined: ' + room);
  isChannelReady = true;
});

socket.on('log', function(array) {
  console.log.apply(console, array);
});


//Driver code
socket.on('message', function(message, room) {
    console.log('Client received message:', message,  room);
    if (message === 'got user media') {
      maybeStart();
    } else if (message.type === 'offer') {
      if (!isInitiator && !isStarted) {
        maybeStart();
      }
      pc.setRemoteDescription(new RTCSessionDescription(message));
      doAnswer();
    } else if (message.type === 'answer' && isStarted) {
      pc.setRemoteDescription(new RTCSessionDescription(message));
    } else if (message.type === 'candidate' && isStarted) {
      var candidate = new RTCIceCandidate({
        sdpMLineIndex: message.label,
        candidate: message.candidate
      });
      pc.addIceCandidate(candidate);
    } else if (message === 'bye' && isStarted) {
      handleRemoteHangup();
    }
});



//Function to send message in a room
function sendMessage(message, room) {
  console.log('Client sending message: ', message, room);
  socket.emit('message', message, room);
}



//Displaying Local Stream and Remote Stream on webpage
var localVideo = document.querySelector('#localVideo');
var remoteVideo = document.querySelector('#remoteVideo');
console.log("Going to find Local media");
navigator.mediaDevices.getUserMedia(localStreamConstraints)
.then(gotStream)
.catch(function(e) {
  alert('getUserMedia() error: ' + e.name);
});

//If found local stream
function gotStream(stream) {
  console.log('Adding local stream.');
  localStream = stream;
  localVideo.srcObject = stream;
  sendMessage('got user media', room);
  if (isInitiator) {
    maybeStart();
  }
}


console.log('Getting user media with constraints', localStreamConstraints);

//If initiator, create the peer connection
function maybeStart() {
  console.log('>>>>>>> maybeStart() ', isStarted, localStream, isChannelReady);
  if (!isStarted && typeof localStream !== 'undefined' && isChannelReady) {
    console.log('>>>>>> creating peer connection');
    createPeerConnection();
    pc.addStream(localStream);
    isStarted = true;
    console.log('isInitiator', isInitiator);
    if (isInitiator) {
      doCall();
    }
  }
}

//Sending bye if user closes the window
window.onbeforeunload = function() {
  sendMessage('bye', room);
};


//Creating peer connection
function createPeerConnection() {
  try {
    pc = new RTCPeerConnection(pcConfig);
    pc.onicecandidate = handleIceCandidate;
    pc.onaddstream = handleRemoteStreamAdded;
    pc.onremovestream = handleRemoteStreamRemoved;
    console.log('Created RTCPeerConnnection');
  } catch (e) {
    console.log('Failed to create PeerConnection, exception: ' + e.message);
    alert('Cannot create RTCPeerConnection object.');
    return;
  }
}

//Function to handle Ice candidates
function handleIceCandidate(event) {
  console.log('icecandidate event: ', event);
  if (event.candidate) {
    sendMessage({
      type: 'candidate',
      label: event.candidate.sdpMLineIndex,
      id: event.candidate.sdpMid,
      candidate: event.candidate.candidate
    }, room);
  } else {
    console.log('End of candidates.');
  }
}

function handleCreateOfferError(event) {
  console.log('createOffer() error: ', event);
}

function doCall() {
  console.log('Sending offer to peer');
  pc.createOffer(setLocalAndSendMessage, handleCreateOfferError);
}

function doAnswer() {
  console.log('Sending answer to peer.');
  pc.createAnswer().then(
    setLocalAndSendMessage,
    onCreateSessionDescriptionError
  );
}

function setLocalAndSendMessage(sessionDescription) {
  pc.setLocalDescription(sessionDescription);
  console.log('setLocalAndSendMessage sending message', sessionDescription);
  sendMessage(sessionDescription, room);
}

function onCreateSessionDescriptionError(error) {
  trace('Failed to create session description: ' + error.toString());
}


function handleRemoteStreamAdded(event) {
  console.log('Remote stream added.');
  remoteStream = event.stream;
  remoteVideo.srcObject = remoteStream;
}

function handleRemoteStreamRemoved(event) {
  console.log('Remote stream removed. Event: ', event);
}

function hangup() {
  console.log('Hanging up.');
  stop();
  sendMessage('bye',room);
}

function handleRemoteHangup() {
  console.log('Session terminated.');
  stop();
  isInitiator = false;
}

function stop() {
  isStarted = false;
  pc.close();
  pc = null;
}