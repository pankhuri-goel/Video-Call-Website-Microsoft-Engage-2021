const socket = io('https://thawing-castle-33909.herokuapp.com/') ; 
const videoGrid = document.getElementById('video-grid') ;
let myVideoStream ;
const myVideo = document.createElement('video') ;
myVideo.muted = true ;

const peer = new Peer() ; 
const myPeer = {}

const user = prompt("Enter your name") ;

navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream => {
    myVideoStream = stream ;
    addVideoStream(myVideo, stream) ;

    peer.on('call', (call) => {
        call.answer(stream)
        const video = document.createElement('video')
        call.on('stream', userVideoStream => {
            addVideoStream(video, userVideoStream)
        }), function(err) {
            console.log('Failed to get local stream', err) ;
        }
    })
    
    socket.on('user-connected', (userId) => {
        connectToNewUser(userId, stream);
        const fc = () => connectToNewUser(userId, stream)
        timerid = setTimeout(fc, 1000 )
    })

    let text = $("input")

    $('html').keydown((e) => {
        if (e.which == 13 && text.val().length !== 0) { 
            socket.emit('message', text.val());
            text.val('')
        }
    });

    socket.on('createMessage', message => {
        $('.messages').append(`<li class = "message"><b>${user}</b><br/>${message}</li>`)
        scrollToBottom()
    })

    socket.on('user-disconnected', userId => {
        if (myPeer[userId])
            myPeer[userId].close()
    })

})

peer.on('open', id => {
    socket.emit('join-room', ROOM_ID, id ) 
})

function connectToNewUser(userId, stream ) {
    const call = peer.call(userId, stream)
    const video = document.createElement('video')
    call.on('stream', userVideoStream => {
      addVideoStream(video, userVideoStream)
    })
    call.on('close', () => {
        video.remove()
    })
    myPeer[userId] = call
}

function addVideoStream(video, stream) {
    video.srcObject = stream ;
    video.addEventListener('loadedmetadata', () => {
        video.play() ;
    })
    videoGrid.append(video) ;
}

const scrollToBottom = () => {
    var d = $('.main__chat_window');
    d.scrollTop(d.prop("scrollHeight"));
}

const muteUnmute = () => {
    const enabled = myVideoStream.getAudioTracks()[0].enabled;
    if (enabled) {
        myVideoStream.getAudioTracks()[0].enabled = false;
        setUnmuteButton();
    } else {
        setMuteButton();
        myVideoStream.getAudioTracks()[0].enabled = true;
    }
}
  
const playStop = () => {
    let enabled = myVideoStream.getVideoTracks()[0].enabled;
    if (enabled) {
        myVideoStream.getVideoTracks()[0].enabled = false;
        setPlayVideo()
    } else {
        setStopVideo()
        myVideoStream.getVideoTracks()[0].enabled = true;
    }
}

const roomLink = () => {
    prompt(
        "Copy this link and share it with people you want to call with -->",
        window.location.href 
    )
}

const setMuteButton = () => {
    const html = `
        <i class="fas fa-microphone"></i>
        <span>Mute</span>
    `
    document.querySelector('.main__mute_button').innerHTML = html;
}
  
const setUnmuteButton = () => {
    const html = `
        <i class="unmute fas fa-microphone-slash"></i>
        <span>Unmute</span>
    `
    document.querySelector('.main__mute_button').innerHTML = html;
}
  
const setStopVideo = () => {
    const html = `
        <i class="fas fa-video"></i>
        <span>Stop Video</span>
    `
    document.querySelector('.main__video_button').innerHTML = html;
}
  
const setPlayVideo = () => {
    const html = `
    <i class="stop fas fa-video-slash"></i>
      <span>Play Video</span>
    `
    document.querySelector('.main__video_button').innerHTML = html;
}
