import { initializeApp } from 'firebase/app'
import {
    getFirestore,
    collection,
    getDocs,
    addDoc,
    doc,
    updateDoc
} from 'firebase/firestore'
import {
    getStorage,
    ref,
    uploadBytes,
    getDownloadURL
} from 'firebase/storage'


const firebaseConfig = {
    apiKey: "AIzaSyDtvbvgqrbhxX2H9wDa3U3evWuysIXXTUo",
    authDomain: "project1-group3-52e2e.firebaseapp.com",
    projectId: "project1-group3-52e2e",
    storageBucket: "project1-group3-52e2e.appspot.com",
    messagingSenderId: "542141188840",
    appId: "1:542141188840:web:d28fadca900aaf3bb7d75d"
};

//install firebase
initializeApp(firebaseConfig);

//install db
const db = getFirestore();
const storage = getStorage();


//ref firestore
const singerRef = collection(db, "singers");
const usersRef = collection(db, "users");
const musicsRef = collection(db, "musics");
const playlistsRef = collection(db, "playlists");
const genresRef = collection(db, "genres");

//ref storage
const imagesStorageRef = ref(storage, "Images")

//elm
const addSingerForm = document.querySelector("#add_singer");
const addMusicForm = document.querySelector("#add_music");
const addGenresForm = document.querySelector("#add_genres");
const tempPic = document.querySelector("#tempPic");
const tempPicSinger = document.getElementById("tempPicSinger");

//status of form
let statusSingerForm = "add";
let statusGenresForm = "add";
let statusMusicForm = "add";


//list singer
let singers = []

//list genres
let genres = []

//list musics
let musics = []

let fullPathMusicFile = '';
let tempSingerName = '';
let tempSingerID = '';
let tempGenresName = '';
let tempGenresID = '';
let tempMusicName = '';
let tempMusicID = '';
let currentMusicSelected;


addSingerForm.url.addEventListener("change", (e) => {
    console.log(addSingerForm.url.value);
    tempPic.src = addSingerForm.url.value;
});

addSingerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    addDoc(singerRef, {
        avtUrl: addSingerForm.url.value,
        desc: addSingerForm.desc.value,
        name: addSingerForm.singerName.value
    }).then(() => {
        addSingerForm.reset();
        tempPic.src = "";
        getData();
    })
})

addMusicForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if (statusMusicForm == "add") {
        getDownloadURL(ref(storage, fullPathMusicFile))
            .then((url) => {
                console.log(url);
                addDoc(musicsRef, {
                    creationDate: Date.now(),
                    name: addMusicForm.name.value,
                    singerID: tempSingerID,
                    singerName: tempSingerName,
                    thumbnailUrl: addMusicForm.thumbnail.value,
                    updateDate: Date.now(),
                    url: url,
                    genresID: tempGenresID,
                    views: Math.ceil(Math.random() * 1000)
                }).then(() => {
                    addMusicForm.reset();
                    tempPicSinger.src = "";
                    addMusicForm.btnAddMusic.disabled = true;
                    getDataMusics();
                })
            }).catch(e => {
                console.log(e);
            })
    } else if (statusMusicForm == "update") {
        const musicUpdate = doc(db, "musics", tempMusicID);
        console.log(musicUpdate);
        updateDoc(musicUpdate, {
            name: addMusicForm.name.value,
            singerID: tempSingerID,
            singerName: tempSingerName,
            thumbnailUrl: addMusicForm.thumbnail.value,
            genresID: tempGenresID
        }).then(() => {
            addMusicForm.reset();
            tempPicSinger.src = "";
            // getData();
            // getDataForGenres();
            getDataMusics();
        }).catch((e) => {
            console.error(e);
        })
    }
})

addMusicForm.file.addEventListener("change", (e) => {
    let fileTag = addMusicForm.file;
    let file = fileTag.files[0];
    let audioTag = document.querySelector("#tempAudio")
    console.log(window.URL.createObjectURL(file));
    file.accept = 'audio/*';
    audioTag.src = window.URL.createObjectURL(file);
    upLoadMusicFile(file);
})

addMusicForm.thumbnail.addEventListener("change", (e) => {
    tempPicSinger.src = addMusicForm.thumbnail.value;
});

//initial data
getData();
function getData() {
    singers = [];
    getDocs(singerRef)
        .then((snapshot) => {
            snapshot.docs.forEach((doc) => {
                singers.push({ ...doc.data(), id: doc.id })
            })
            console.log(singers);
            loadDataForSelector();
        })
        .catch(e => {
            console.log(e.message);
        })
}

//load data for selector
function loadDataForSelector() {
    const selector = addMusicForm.selector_singer;
    selector.innerHTML = "";
    singers.forEach(singer => {
        let temp = `<option data-id="${singer.id}">${singer.name}</option>`;
        selector.innerHTML += temp;
    })
    tempSingerName = selector.value;
    tempSingerID = getIdSinger();
    console.log({ tempSingerName, tempSingerID });
}
//get current select item
addMusicForm.selector_singer.addEventListener("change", (e) => {
    tempSingerName = addMusicForm.selector_singer.value;
    tempSingerID = getIdSinger();
    console.log({ tempSingerName, tempSingerID });
})


//load data for music's genres
getDataForGenres();
function getDataForGenres() {
    genres = [];
    getDocs(genresRef)
        .then((snapshot) => {
            snapshot.docs.forEach(doc => {
                genres.push({ ...doc.data(), id: doc.id })
            })
            console.log(genres);
            loadDataGenresForSelector();
        }).catch((e) => {
            console.error(e);
        });
}
//get current selected item of genres
addMusicForm.selector_genres.addEventListener("change", (e) => {
    tempGenresName = addMusicForm.selector_genres.value;
    tempGenresID = getIdGenres();
    console.log({ tempGenresID, tempGenresName });
})

//load data-genres for selector
function loadDataGenresForSelector() {
    const selector = addMusicForm.selector_genres;
    selector.innerHTML = "";
    genres.forEach(genre => {
        let temp = `<option data-id="${genre.id}">${genre.name}</option>`;
        selector.innerHTML += temp;
    })
    tempGenresName = selector.value;
    tempGenresID = getIdGenres();
    console.log({ tempGenresID, tempGenresName });
}

function getIdGenres() {
    let options = addMusicForm.selector_genres.getElementsByTagName("option");
    for (let i = 0; i < options.length; i++) {
        if (options[i].innerHTML == tempGenresName) {
            return options[i].getAttribute("data-id");
        }
    }
    return "";
}

function getIdSinger() {
    let options = addMusicForm.selector_singer.getElementsByTagName("option");
    for (let i = 0; i < options.length; i++) {
        if (options[i].innerHTML == tempSingerName) {
            return options[i].getAttribute("data-id");
        }
    }
    return "";
}

const upLoadMusicFile = (file) => {
    let nowDate = Date.now();
    uploadBytes(ref(storage, `Musics/${nowDate}-${file.name}`), file).then((snapshot) => {
        console.log('Uploaded a blob or file!');
        console.log(snapshot);
        fullPathMusicFile = snapshot.metadata.fullPath;
        addMusicForm.btnAddMusic.disabled = false;
    });
}

/// handle update data

//status radio group
const radioStatusSinger = document.getElementsByName("statusSinger");
const radioStatusMusic = document.getElementsByName("statusMusic");
const radioStatusGenres = document.getElementsByName("statusGenres");

//status title
const statusTitleSinger = document.getElementById("statusSingerForm");
const statusTitleGenres = document.getElementById("statusGenresForm");
const statusTitleMusic = document.getElementById("statusMusicForm");

console.log({ radioStatusGenres, radioStatusMusic, radioStatusSinger });


onChangeSelectorListener(radioStatusGenres, "genres");
onChangeSelectorListener(radioStatusMusic, "music");
onChangeSelectorListener(radioStatusSinger, "singer");

// onchange radio group
function onChangeSelectorListener(radioStatus, type) {
    radioStatus.forEach((radio, index) => {
        if (index == 0) {
            radio.addEventListener("change", () => {
                changeStatus(type, "update");
                changeStatusForButton(type);
            })
        } else {
            radio.addEventListener("change", () => {
                changeStatus(type, "add");
                changeStatusForButton(type);
            })
        }
    })
}

function changeStatus(type, value) {
    switch (type) {
        case "singer":
            statusSingerForm = value;
            break;
        case "music":
            statusMusicForm = value;
            break;
        case "genres":
            statusGenresForm = value;
            break;
        default:
            throw new Error("Invalid Error");
    }
}

function changeStatusForButton(typeForm) {
    switch (typeForm) {
        case "singer": {
            // let btnAdd = document.getElementById("btnAddSinger");
            // if (statusSingerForm == "add") {
            //     btnAdd.innerHTML = "Thêm dữ liệu"
            //     statusTitleSinger.innerText = "Trạng thái form: Thêm";
            // } else {
            //     btnAdd.innerHTML = "Cập nhật dữ liệu"
            //     statusTitleSinger.innerText = "Trạng thái form: Cập nhật";
            // }
            // break;
        }
        case "genres": {
            // let btnAdd = document.getElementById("btnAddGenres");
            // if (statusGenresForm == "add") {
            //     btnAdd.innerHTML = "Thêm dữ liệu"
            //     statusTitleGenres.innerText = "Trạng thái form: Thêm";
            // } else {
            //     btnAdd.innerHTML = "Cập nhật dữ liệu"
            //     statusTitleGenres.innerText = "Trạng thái form: Cập nhật";
            // }
            // break;
        }
        case "music": {
            let btnAdd = document.getElementById("btnAddMusic");
            if (statusMusicForm == "add") {
                statusTitleMusic.innerText = "Trạng thái form: Thêm";
                btnAdd.innerHTML = "Thêm dữ liệu"
                selector_update_music.disabled = true;
                addMusicForm.btnAddMusic.disabled = true;
                addMusicForm.file.required = true;
                // console.log(statusSingerForm);
            } else {
                btnAdd.innerHTML = "Cập nhật dữ liệu"
                statusTitleMusic.innerText = "Trạng thái form: Cập nhật";
                selector_update_music.disabled = false;
                addMusicForm.btnAddMusic.disabled = false;
                addMusicForm.file.required = false;
                fillFormData(currentMusicSelected);
            }
            break;
        }
        default: {
            throw new Error("Invalid type of form");
        }
    }
    console.log({ statusGenresForm, statusMusicForm, statusSingerForm });
}


// declare selector update music
const selector_update_music = document.getElementById("selector_update_music");
console.log(selector_update_music);

//get music list
getDataMusics();
function getDataMusics() {
    musics = [];
    getDocs(musicsRef)
        .then((snapshot) => {
            snapshot.docs.forEach(doc => {
                musics.push({ ...doc.data(), id: doc.id })
            })
            loadDataForSelectorMusic();
        }).catch(e => {
            console.error(e);
        })
}

function loadDataForSelectorMusic() {
    selector_update_music.innerHTML = "";
    console.log(musics);
    musics.forEach(music => {
        let temp = `<option data-id="${music.id}">${music.name}</option>`;
        selector_update_music.innerHTML += temp;
    })
    tempMusicName = selector_update_music.value;
    tempMusicID = getMusicID();
    console.log({ tempMusicName, tempMusicID });
    currentMusicSelected = musics.filter((music) => {
        return music.id === tempMusicID;
    })
    // console.log(currentMusicSelected);
}

function getMusicID() {
    let options = selector_update_music.getElementsByTagName("option");
    for (let i = 0; i < options.length; i++) {
        if (options[i].innerHTML == tempMusicName) {
            return options[i].getAttribute("data-id");
        }
    }
    return "";
}

//handle fill data into form
selector_update_music.addEventListener("change", () => {
    tempMusicName = selector_update_music.value;
    tempMusicID = getMusicID();
    console.log({ tempMusicName, tempMusicID });
    currentMusicSelected = musics.filter((music) => {
        return music.id === tempMusicID;
    })
    fillFormData(currentMusicSelected);
})

function fillFormData(curentMusic) {
    console.log(currentMusicSelected);
    addMusicForm.name.value = curentMusic[0].name;
    addMusicForm.thumbnail.value = curentMusic[0].thumbnailUrl;
    tempPicSinger.src = addMusicForm.thumbnail.value;
    document.querySelector("#tempAudio").src = curentMusic[0].url;
    let selector_genres = addMusicForm.selector_genres;
    selector_genres[0].selected = true;
    let selector_singer = addMusicForm.selector_singer;
    choiceValueOfCurrentMusic(selector_genres, curentMusic[0].genresID ?? "");
    choiceValueOfCurrentMusic(selector_singer, curentMusic[0].singerID);
    tempSingerName = selector_singer.value;
    tempSingerID = getIdSinger();
    tempGenresName = selector_genres.value;
    tempGenresID = getIdGenres();
}

function choiceValueOfCurrentMusic(selector, value) {
    let options = selector.getElementsByTagName("option");
    for (let i = 0; i < options.length; i++) {
        if (options[i].getAttribute("data-id") == value) {
            options[i].selected = true;
            return;
        }
    }
}
