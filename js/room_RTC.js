const APP_ID = "e017ab98b6be4056b85d2920c0699a77"

let uid = sessionStorage.getItem('uid')
if(!uid){
	uid = String(Math.floor(Math.random() * 10000))
	sessionStorage.setItem('uid' , uid)
}


let token = null;
let client;

let rtmClient;
let channel;


const queryString = window.location.search // returns the url of the page
const urlParams = new URLSearchParams(queryString)

let roomId = urlParams.get('rooms') // to get multiple rooms in the video app

if(!roomId){
	roomId = 'main'
}

let localTracks = []  // where the user can follow the streams
let remoteUsers = {} // the reciever can actually follow up the  stream

let localScreenTracks;
let sharingScreen = false;

let displayName = sessionStorage.getItem('display__name')
if(!displayName){
	window.location = 'lobby.html'
}


let joinroomInit = async () =>  {

	rtmClient = await AgoraRTM.createInstance(APP_ID);
	await rtmClient.login({uid,token});

	await rtmClient.addOrUpdateLocalUserAttributes({'name':displayName})

	channel = await rtmClient.createChannel(roomId)
	await channel.join()

	channel.on('MemberJoined',handleMemberJoined)
	channel.on('MemberLeft',handleMemberLeft)
	channel.on('ChannelMessage' , handleChannelMessage)

	getMembers()
	addbotMessagesToDom(`Welcome to the room ${displayName} 👋`)

	client = AgoraRTC.createClient({mode:'rtc' , codec:'vp8'})
	await client .join(APP_ID, roomId, token, uid)

	client.on('user-published', handleUserPublished)
	client.on('user-left', handleUserLeft)


}
// this above code takes care of the joining of the room


let joinstream = async () => {
	document.getElementById('join-btn').style.display = 'none'
	document.getElementsByClassName('stream__actions')[0].style.display = 'flex'
	localTracks = await AgoraRTC.createMicrophoneAndCameraTracks()
	// insert a the video boxes in the home page
	let player = `<div class="video__container" id="user-container-${uid}">
						<div class = "video-player"  id="user-${uid}" ></div>
					</div>`
	document.getElementById('streams__container').insertAdjacentHTML('beforeend', player)
	document.getElementById(`user-container-${uid}`).addEventListener('click', expandVideoFrame)

	localTracks[1].play(`user-${uid}`) // playing the video tracks for any user
	await client.publish([localTracks[0], localTracks[1]]) // publish both the video and the audia
}
// this block of code handles the joining of the video and audio Tracks


let handleUserPublished = async (user , mediaType)=>{ //  function to get another users in the track
	remoteUsers[user.uid] = user // for each and  every index in  remote users

	await client.subscribe(user , mediaType) //  passing in the media type to the user

	let player = document.getElementById(`user-container-${user.uid}`) //
	if(player === null){
		player = `<div class="video__container" id="user-container-${user.uid}">
				<div class = "video-player"  id="user-${user.uid}" ></div>
			</div>`
		document.getElementById('streams__container').insertAdjacentHTML('beforeend', player) //
		document.getElementById(`user-container-${user.uid}`).addEventListener('click',expandVideoFrame)
	}

	if(displayFrame.style.display){
		let videoFrames = document.getElementById(`user-container-${user.uid}`)
		videoFrames.style.height = '150px'
		videoFrames .style.width = '150px'
	}

	if(mediaType === 'video'){
		user.videoTrack.play(`user-${user.uid}`)
	}
	if(mediaType === 'audio'){
		user.audioTrack.play()
	}
}
// this block of code takes care of the publishing of streams



let switchToCamera = async()=>{ // function to control the control of the switbh camera
	let player = `<div class="video__container" id="user-container-${uid}">
				   <div class = "video-player"  id="user-${uid}" ></div>
				</div>`
	displayFrame.insertAdjacentHTML('beforeend', player)
	await localTracks[0].setMuted(true) // while switching the camera mute the audio tracks
	await localTracks[1].setMuted(true)// while switching the camera mute the video tracks

	document.getElementById('mike-btn').classList.remove('active'); // for the button, remove the purple camera icon
	document.getElementById('screen-btn').classList.remove('active'); // remove the camera button

	localTracks[1].play(`user-${uid}`)
	await client.publish([localTracks[1]])

}


let handleUserLeft = async (user)=>{ // to handle all the request that all the users that left the app
	delete remoteUsers[user.uid]
	document.getElementById(`user-container-${user.uid}`).remove() // when a user leaves the streams remove the video container

	if(userIdInDisplayFrame === `user-container-${user.uid}`){
		displayFrame.style.display = null

		let videoFrames = document.getElementsByClassName('video__container')

		for(let i= 0; videoFrames.length > i; i++){
			videoFrames[i].style.height = '160px'
			videoFrames[i].style.width = '160px' // return the video size back to normal
		}
	}
}
// this block of code takes care of  the user leaving the app

let toogleCamera =  async (e) => { // effect to toogle the camera  and display the screen dark
	let button = e.currentTarget

	if(localTracks[1].muted){
		await localTracks[1].setMuted(false)
		button.classList.add("active");
	}
	else{
		await localTracks[1].setMuted(true) // remove the color if  the audo track is muted
		button.classList.remove("active");
	}
}

// this block of code handles the toggling effect of the camera

let toggleMicrophone = async (e)=>{ // effect to toggle the cameta
	let button = e.currentTarget

	if(localTracks[0].muted){
		await localTracks[0].setMuted(false)
		button.classList.add("active");
	}else{
		await localTracks[0].setMuted(true)
		button.classList.remove("active");
	}
}
// this block of code handles the toggling of the microphone

let toggleScreen = async (e) => { // sharing screen effect and the toggling effect
	let screenButton = e.currentTarget
	let cameraButton = document.getElementById ("camera-btn")
	if(!sharingScreen){
		sharingScreen =  true   //
		screenButton.classList.add("active") // target
		cameraButton.classList.remove("active") // remove the camera button
		cameraButton.style.display = 'none'; // display is None

		localScreenTracks = await AgoraRTC.createScreenVideoTrack() // asking agora to give permission to give a screen sharing

		document.getElementById(`user-container-${uid}`).remove() // remove the current user if the screen is to be shared
		displayFrame.style.display = 'block'

		let player = `<div class="video__container" id="user-container-${uid}">
					<div class = "video-player"  id="user-${uid}" ></div>
				</div>`

		displayFrame.insertAdjacentHTML('beforeend' , player)
		document.getElementById(`user-container-${uid}`).addEventListener('click', expandVideoFrame) // when you click the screen video track it expands

		userIdInDisplayFrame = `user-container-${uid}`
		localScreenTracks.play(`user-${uid}`) // play the current track

		await client.unpublish(localTracks[1]) // disconnet with the local video tracks
		await client.publish([localScreenTracks]) // connet with the screen sharing tracks


		let videoFrames = document.getElementByClassName('video__container')
		for(let i=0; videoFrames.length > i; i++){
			if(videoFrames[1].id != userIdInDisplayFrame){
				videoFrames[i].style.height = '100px'
				videoFrames[i].style.width = '100px'
			}
		}
	}else{
		sharingScreen = false
		cameraButton.style.display = 'block';
		document.getElementById(`user-container-${uid}`).remove();
		await client.unpublish([localScreenTracks])
		switchToCamera()

	}
}
// this block of code handles the sharing and toggling of the screen between two users
let leaveStream = async (e)=> {
	e.preventDefault()
	document.getElementById('join-btn').style.display = 'block'
	document.getElementsByClassName('stream__actions')[0].style.display = 'none'

	for(let i=0; localTracks.length >i; i++ ){
		localTracks[i].stop()
		localTracks[i].close()
	}
	await client.unpublish([localTracks[0], localTracks[1]])

	if(localScreenTracks){
		await client.unpublish([localScreenTracks])
	}
	document.getElementById(`user-container-${uid}`).remove()

	if(userIdInDisplayFrame === `user-container-${uid}`){
		displayFrame.style.display = null


		for(let i= 0; videoFrames.length > i; i++){
			videoFrames[i].style.height = '170px'
			videoFrames[i].style.width = '170px'
		}

	}

}


document.getElementById("mike-btn").addEventListener('click' , toggleMicrophone);
document.getElementById("camera-btn").addEventListener('click' , toogleCamera);
document.getElementById("screen-btn").addEventListener('click', toggleScreen);
document.getElementById('join-btn').addEventListener('click' , joinstream);
document.getElementById('leave-btn').addEventListener('click' , leaveStream );
joinroomInit();











