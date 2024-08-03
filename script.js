const socket = io('/');
const myVideo = document.getElementById('myVideo');
const peerVideo = document.getElementById('peerVideo');
let myPeer;
let peerId;

navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(stream => {
    myVideo.srcObject = stream;

    socket.emit('join');

    socket.on('match', data => {
        peerId = data.id;
        myPeer = new SimplePeer({
            initiator: true,
            trickle: false,
            stream: stream
        });

        myPeer.on('signal', signal => {
            socket.emit('signal', { signal: signal, to: peerId });
        });

        myPeer.on('stream', peerStream => {
            peerVideo.srcObject = peerStream;
        });
    });

    socket.on('signal', data => {
        if (!myPeer) {
            myPeer = new SimplePeer({
                initiator: false,
                trickle: false,
                stream: stream
            });

            myPeer.on('signal', signal => {
                socket.emit('signal', { signal: signal, to: data.from });
            });

            myPeer.on('stream', peerStream => {
                peerVideo.srcObject = peerStream;
            });
        }
        myPeer.signal(data.signal);
    });
}).catch(error => {
    console.error('Error accessing media devices.', error);
});
