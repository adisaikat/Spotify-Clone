console.log("Wassup dawg!")
let currFolder = ""
let index = 0;
let currentSong = new Audio();
let songs = []
let playButton = document.querySelector(".play")
//global keybing
document.addEventListener("keypress", (e) => {
  if (e.key == ' ') {
    e.preventDefault();
    if (currentSong.paused != true) {
      currentSong.pause()
      playButton.innerHTML = `<img src="images/play-circle.svg" alt="">`
    } else {
      currentSong.play()
      playButton.innerHTML = `<img src="images/pause-circle.svg" alt="">`
    }
  }
})

async function loadAlbums() {
  let res = await fetch(`http://localhost:8000/songs/`)
  let div = document.createElement("div")
  div.innerHTML = await res.text()
  let query = document.querySelector(".card-container")

  Array.from(div.querySelectorAll("a")).forEach(async link => {
    if (link.innerHTML.endsWith("/")) {
      let album = "/songs/" + link.innerHTML
      let albumName = link.innerHTML
      let albumCover = album + `cover.jpg`
      let description = "No description"

      let dsc = await fetch(album + "info.json")
      let response = await dsc.json()
      description = response.description

      let html = `
        <div class="card pointer col-hover rounded" data-folder="${albumName.replace("/", "")}">
          <div class="card-img">
            <img src="${albumCover}" alt="image">
          </div>
          <div class="libplay">
            <img src="images/play.svg" alt="">
          </div>
          <h2>${albumName.replace("/", "").replace("_", " ")}</h2>
          <p>${description}</p>
        </div>
      `
      query.insertAdjacentHTML("beforeend", html)
    }
  })
}

//load Playlist from card 
async function loadPlaylist() {
  document.querySelector(".card-container").addEventListener("click", async (item) => {
    const card = item.target.closest(".card")
    if (!card) return

    playButton.innerHTML = `<img src="images/play-circle.svg" alt="">`
    currentSong.currentTime = 0
    songs = []
    currFolder = card.dataset.folder
    songs = await getSongs(`${currFolder}`)
    await addSongsName()
  })
}

async function getSongs() {
  let a = await fetch(`http://localhost:8000/songs/${currFolder}/`)
  let response = await a.text();
  let div = document.createElement("div")
  div.innerHTML = response
  let as = div.getElementsByTagName("a")

  for (let index = 0; index < as.length; index++) {
    const element = as[index];
    if (element.href.endsWith(".mp3")) {
      songs.push(`http://127.0.0.1:8000/songs/${currFolder}/` + element.getAttribute("href"))
    }
  }
  currentSong.src = songs[0]
  currentSong.load()
  document.querySelector(".s-title").innerHTML = songs[0].split(`${currFolder}/`)[1].replaceAll("%20", " ").replaceAll("%21", "!").replaceAll(".mp3", "").slice(0, 30) + "..."
  return songs
}

async function addSongsName() {
  let songList = document.querySelector(".songs > ul")
  songList.innerHTML = ""

  for (const it of songs) {
    let title = it.split(`${currFolder}/`)[1].replaceAll("%20", " ").replaceAll("%21", "!")
    let div = `
  <li class="flex song rounded pointer p-16 sp-btw align-items-centre col-hover">
  <img src="images/music.svg" class="invert" alt="">
  <span class="song-title">${title}</span>
  <div class="listButton">
  <img src="images/play.svg" class="invert" alt="">
  </div>
  </li>`
    songList.innerHTML += div
  }
}



function songPlayer() {
  document.querySelector(".songs").addEventListener("click", (e) => {
    const li = e.target.closest("li")
    if (!li) return
    const title = li.querySelector(".song-title")
    if (!title) return
    const songName = title.innerHTML.trim()

    playSong(`/songs/${currFolder}/${songName}`)
  })
}

async function playSong(track) {
  ind = 0
  currentSong.src = track
  currentSong.load()
  await currentSong.play()
  songs.forEach(e => {
    if (e.split(`${currFolder}/`)[1].replaceAll("%20", " ").replaceAll("%21", "!") == track.split(`${currFolder}/`)[1]) {
      index = ind
      Array.from(document.querySelector(".card-container").getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
          songs = []
          currFolder = item.currentTarget.dataset.folder
          songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)
          await addSongsName()
        })
      })
      return
    } else {
      ind++
    }
  })
  playButton.innerHTML = `<img src="images/pause-circle.svg" alt="">`
    document.querySelector(".s-title").innerHTML = track.split(`${currFolder}/`)[1].replaceAll("%20", " ").replaceAll("%21", "!").slice(0, 30) + "..."
  }

  const playbarFn = () => {
    //playbar functionality
    playButton.addEventListener("click", () => {
      if (currentSong.paused != true) {
        currentSong.pause()
        playButton.innerHTML = `<img src="images/play-circle.svg" alt="">`
      } else {
        currentSong.play()
        playButton.innerHTML = `<img src="images/pause-circle.svg" alt="">`
      }
    })
  }

  function secsToMin(secs) {
    let mins = Math.floor(secs / 60)
    secs = Math.floor(secs % 60)
    mins = String(mins).padStart(2, '0')
    secs = String(secs).padStart(2, '0')
    return `${mins}:${secs}`
  }

  function dragBar() {
    const seekbar = document.querySelector(".seekbar");
    const progress = document.querySelector(".progress");

    let isDragging = false;

    seekbar.addEventListener("mousedown", (e) => {
      isDragging = true;
      updateSeek(e);
    });

    document.addEventListener("mousemove", (e) => {
      if (isDragging) {
        updateSeek(e);
      }
    });

    document.addEventListener("mouseup", () => {
      if (isDragging) {
        isDragging = false;
      }
    });

    function updateSeek(e) {
      const rect = seekbar.getBoundingClientRect();
      const clickX = e.clientX - rect.left
      const width = rect.width
      let percent = (clickX / width) * 100

      percent = Math.max(0, Math.min(percent, 100));
      progress.style.width = percent + "%"

      if (!isNaN(currentSong.duration)) {
        currentSong.currentTime = (percent / 100) * currentSong.duration;
      }
    }
  }

  //update volume
  function volumeBar() {
    let volbar = document.querySelector(".volbar")
    let vol = document.querySelector(".volume")

    let isDragging = false;

    volbar.addEventListener("mousedown", (e) => {
      isDragging = true;
      updateVol(e);
    });

    document.addEventListener("mousemove", (e) => {
      if (isDragging) {
        updateVol(e);
      }
    });

    document.addEventListener("mouseup", () => {
      if (isDragging) {
        isDragging = false;
      }
    });

    function updateVol(e) {
      const rect = volbar.getBoundingClientRect();
      const clickX = e.clientX - rect.left
      const width = rect.width
      let percent = (clickX / width) * 100

      percent = Math.max(0, Math.min(percent, 100));
      vol.style.width = percent + "%"

      currentSong.volume = (percent / 100);
    }
  }

  function muteUnmute() {
    document.querySelector(".mute").addEventListener("click", () => {
      if (currentSong.muted == true) {
        document.querySelector(".mute").src = "/images/volume.svg"
        currentSong.muted = false
      } else {
        document.querySelector(".mute").src = "/images/mute.svg"
        currentSong.muted = true
      }
    })
  }

  function prevNext() {
    //event Listeners for previous and next
    document.querySelector(".next").addEventListener("click", () => {
      if (index < songs.length - 1) {
        playSong(songs[++index])
      } else {
        playSong(songs[0])
        index = 0
      }
    })

    document.querySelector(".prev").addEventListener("click", () => {
      if (currentSong.currentTime < 10) {
        if (index > 0) {
          playSong(songs[--index])
        } else {
          playSong(songs[songs.length - 1])
          index = songs.length - 1
        }
      } else {
        currentSong.currentTime = 0
      }
    })
  }

  async function main() {
    await loadAlbums()
    await loadPlaylist()
    playbarFn()
    songPlayer()
    dragBar()
    muteUnmute()
    volumeBar()
    prevNext()

    //update time and seekbar
    currentSong.addEventListener("timeupdate", () => {
      document.querySelector(".curr-time").innerHTML = secsToMin(currentSong.currentTime)
      document.querySelector(".total-time").innerHTML = secsToMin(currentSong.duration)
      document.querySelector(".progress").style.width = (currentSong.currentTime / currentSong.duration) * 100 + "%"
      document.querySelector(".volume").style.width = (currentSong.volume) * 100 + "%"
    })

  }

  main()
