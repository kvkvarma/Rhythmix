
let play = document.getElementById('play');
const fetchSongs = async () => {
    let a = await fetch('http://127.0.0.1:3000/songs/');
    let response = await a.text();
    let div = document.createElement('div');
    div.innerHTML = response;
    let as = div.getElementsByTagName('a');
    let songs = [];

    for (let i = 0; i < as.length; i++) {
        const element = as[i];
        if (element.href.endsWith('.mp3'))
            songs.push(element.href.split('/songs/')[1]);
    }
    return songs;
}
let currSong = new Audio();

function playMusic(track,pause=false){
    currSong.src = "songs/"+track;
    if(!pause){
        currSong.play();
        play.src = "pause.svg"
    }
    else{
        play.src = "play.svg"
    }
        document.querySelector('.songname').innerHTML = decodeURI(track);
        document.querySelector('.songtime').innerHTML = `00:00/00:00`;
    
}

async function main() {
    songs = await fetchSongs();
    playMusic(songs[0],true);
    console.log(songs)
    let songsUl = document.querySelector('.songcard').getElementsByTagName('ul')[0];
    for (const song of songs) {
        songsUl.innerHTML += `<li>
                                <img src="music.svg" class="invert" alt="">
                                <div class="info">${song.replaceAll('%20'," ")}</div>
                                <button class="playbtn"><img src="play.svg" class="invert" alt=""></button>
                                
                            </li>`
    }

    //Attaching Event Listener to all of the li's;
    Array.from(document.querySelector('.songcard').getElementsByTagName('li')).forEach((e)=>{
        e.addEventListener('click',()=>{
            playMusic(e.querySelector('.info').innerHTML);
        })
    })

    play.addEventListener("click",()=>{
        if(currSong.src == ""){
            play.src = "play.svg"
        }
        else if(currSong.paused){
            currSong.play();
            play.src = "pause.svg";
        }
        else{
            currSong.pause();
            play.src = "play.svg";
        }
    })
}

function formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

currSong.addEventListener('timeupdate',()=>{
    document.querySelector('.songtime').innerHTML = `${formatTime(currSong.currentTime)}/${formatTime(currSong.duration)}`;
    document.querySelector('.circle').style.left = ((currSong.currentTime)/(currSong.duration))*100+'%';
    if(currSong.currentTime == currSong.duration){
        play.src = "play.svg"
    }
})  

document.addEventListener("keydown", (event) => {
    console.log(event)
    if (event.code === "Space") {
        if (currSong.paused) {
            currSong.play();
            play.src = "pause.svg";
        } else {
            currSong.pause();
            play.src = "play.svg";
        }
    }
});
document.querySelector('.seekbar').addEventListener('click',(e)=>{
    let percent = ((e.offsetX)/(e.target.getBoundingClientRect().width))*100;
    document.querySelector('.circle').style.left = percent+"%";
    currSong.currentTime = ((currSong.duration)*percent)/100;
})

main();