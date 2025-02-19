let play = document.getElementById('play');
let songs;
let currFolder;


const fetchSongs = async (folder) => {
    currFolder = folder;
    let a = await fetch(`http://127.0.0.1:3000/${folder}`);
    let response = await a.text();
    let div = document.createElement('div');
    div.innerHTML = response;
    let as = div.getElementsByTagName('a');
    songs = [];
    for (let i = 0; i < as.length; i++) {
        const element = as[i];
        if (element.href.endsWith('.mp3'))
            songs.push(element.href.split(`/${folder}/`)[1]);
    }

    let songsUl = document.querySelector('.songcard').getElementsByTagName('ul')[0];
    songsUl.innerHTML ="";
    for (const song of songs) {
        songsUl.innerHTML += `<li>
                                <img src="assets/music.svg" class="invert" alt="">
                                <div class="info">${song.replaceAll('%20'," ")}</div>
                                <div class="imgp">
                                <span>Play</span>
                                    <img class="playimg invert" src="assets/play.svg" alt="">
                                </div>
                            </li>`
    }

    Array.from(document.querySelector('.songcard').getElementsByTagName('li')).forEach((e)=>{
        e.addEventListener('click',()=>{
            playMusic(e.querySelector('.info').innerHTML);
        })
    })

}


let currSong = new Audio();
function playMusic(track,pause=false){
    currSong.src = `${currFolder}/`+track;
    if(!pause){
        currSong.play();
        play.src = "assets/pause.svg"
    }
    else{
        play.src = "assets/play.svg"
    }
        document.querySelector('.songname').innerHTML = decodeURI(track).split('.mp3')[0];
        document.querySelector('.songtime').innerHTML = `00:00/00:00`;
    
}

async function displayAlbums() {
        const response = await fetch('http://127.0.0.1:3000/songs/');
        const htmlText = await response.text();
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = htmlText;
        const anchors = tempDiv.getElementsByTagName('a');
        let cardContainer = document.querySelector('.cardContainer');
        let array = Array.from(anchors)
        for(let i =0;i<array.length;i++){
            anchor = array[i];
            if (anchor.href.includes('songs')) {
                let name = anchor.href.split('/songs/')[1];
                albumName = name.slice(0,name.length-1);
                let details = await fetch(`http://127.0.0.1:3000/songs/${albumName}/info.json`);
                const text = await details.json();
                cardContainer.innerHTML += `
                     <div data-folder=${albumName} class="card rounded">
                            <div class="play">
                                <svg width="16" height="16" viewBox="0 0 24 24"fill="#000000"                     xmlns="http://www.w3.org/2000/svg">
                                    <path
                                        d="M5 20V4L19 12L5 20Z" stroke="#141B34" stroke-width="1.5" stroke-linejoin="round"
                                    />
                                </svg>
                            </div>
                            <img
                                src="${text.src}  "
                                alt=""
                            />
                            <h3>${text.name}</h3>
                            <p>
                                ${text.desc}
                            </p>
                    </div>
                `
            }
        }
        Array.from(document.getElementsByClassName('card')).forEach((e)=>{
            e.addEventListener('click',async(item)=>{
                songs = await fetchSongs(`songs/${item.currentTarget.dataset.folder}`);
            })
        })
}
async function main() {
    await fetchSongs(`songs/Amaran`);
    playMusic(songs[0],true);
    await displayAlbums();

    play.addEventListener("click",()=>{
        if(currSong.src == ""){
            play.src = "assets/play.svg"
        }
        else if(currSong.paused){
            currSong.play();
            play.src = "assets/pause.svg";
        }
        else{
            currSong.pause();
            play.src = "assets/play.svg";
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
        play.src = "assets/play.svg"
    }
})  

document.addEventListener("keydown", (event) => {
    if (event.code === "Space") {
        if (currSong.paused) {
            currSong.play();
            play.src = "assets/pause.svg";
        } else {
            currSong.pause();
            play.src = "assets/play.svg";
        }
    }
});
document.querySelector('.seekbar').addEventListener('click',(e)=>{
    let percent = ((e.offsetX)/(e.target.getBoundingClientRect().width))*100;
    document.querySelector('.circle').style.left = percent+"%";
    currSong.currentTime = ((currSong.duration)*percent)/100;
})

document.querySelector('.hamburgerdiv').addEventListener('click',()=>{
    document.querySelector('.left').style.left = "0%";
})
document.querySelector('.close').addEventListener('click',()=>{
    document.querySelector('.left').style.left = "-100%"
})

document.querySelector('#prev').addEventListener('click',()=>{
    let index = songs.indexOf(currSong.src.split('/').slice(-1)[0]);
    if(index-1 >= 0){
        playMusic(songs[index-1]);
    }
})
document.querySelector('#next').addEventListener('click',()=>{
    let index = songs.indexOf(currSong.src.split('/').slice(-1)[0]);
    if(index+1 < songs.length){
        playMusic(songs[index+1]);
    }
})
document.querySelector('.timeVol').getElementsByTagName('input')[0].addEventListener('change',(e)=>{
    let vol = e.target.value;
    if(vol>0){
        let volumeIcon = document.querySelector('.volumebtn');
        volumeIcon.src = "assets/volume.svg";
    }
    currSong.volume = parseInt(vol)/100;
})

document.querySelector('.volumebtn').addEventListener('click', () => {
    let volumeSlider = document.querySelector('.voli input');
    let volumeIcon = document.querySelector('.volumebtn');
    volumeSlider.value = 0;
    currSong.volume = 0;
    volumeIcon.src = "assets/volumeoff.svg";
});


main();