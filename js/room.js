let messagesContainer = document.getElementById('messages');

const memberContainer = document.getElementById('members__container');
const memberButton = document.getElementById('members__button');

const chatContainer = document.getElementById('messages__container');
const chatButton = document.getElementById('chat__button');

let activeMemberContainer = false;

memberButton.addEventListener('click', () => {
  if (activeMemberContainer) {
    memberContainer.style.display = 'none';
  } else {
    memberContainer.style.display = 'block';
  }
  activeMemberContainer = !activeMemberContainer;
});

let activeChatContainer = false;

chatButton.addEventListener('click', () => {
  if (activeChatContainer) {
    chatContainer.style.display = 'none';
  } else {
    chatContainer.style.display = 'block';
  }
  activeChatContainer = !activeChatContainer;
});



let displayFrame = document.getElementById('stream__box') // the user frames on the lower end
let videoFrames =  document.getElementsByClassName('video__container') // the bigger box for the user that clicks the screen

let userIdInDisplayFrame =  null;

let expandVideoFrame = (e) => { // this is an event for expanding the video frame
  let child = displayFrame.children[0] //
  if(child){
    document.getElementById('streams__container').appendChild(child)
  }
  displayFrame.style.display = 'block' // the display frame style of display
  displayFrame.appendChild(e.currentTarget) // append the child element that has been clicked
  userIdInDisplayFrame = e.currentTarget.id // show based on the id of the user that has clicked the screen

  for(let i=0; videoFrames.length > i; i++){
    if(videoFrames[i].id != userIdInDisplayFrame){
      videoFrames[i].style.height = '100px'
      videoFrames[i].style.width  = '100px'
    }
  }
}

// this block of code takes care of the expanded vidoe frame of the user

for(let i=0 ; videoFrames.length > i; i++){
  videoFrames[i].addEventListener('click' , expandVideoFrame)

}

let hideDisplayFrame =()=>{
  userIdInDisplayFrame = null
  displayFrame.style.display = null

  let child = displayFrame.children[0]
  document.getElementById('streams__container').appendChild(child)
  for(let i= 0; videoFrames.length > i; i++){
    videoFrames[i].style.height = '170px'
    videoFrames[i].style.width = '170px'
  }
}

displayFrame.addEventListener('click', hideDisplayFrame)


















