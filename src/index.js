import { initializeApp } from 'firebase/app'
import {
    getFirestore,
    collection,
    getDocs,
    addDoc,
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

//ref storage
const imagesStorageRef = ref(storage, "Images")

//elm
const addSingerForm = document.querySelector("#add_singer");
const addMusicForm = document.querySelector("#add_music");
const tempPic = document.querySelector("#tempPic");
const tempPicSinger = document.getElementById("tempPicSinger");

//list singer
let singers = []
let fullPathMusicFile = '';
let tempSingerName = '';
let tempSingerID = '';

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
        getData()
    })
})

addMusicForm.addEventListener("submit", (e) => {
    e.preventDefault();
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
                views: 0
            }).then(() => {
                addMusicForm.reset();
                tempPicSinger.src = "";
                addMusicForm.btnAddMusic.disabled = true;
            })
        }).catch(e => {
            console.log(e);
        })
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
    const selector = addMusicForm.selector;
    selector.innerHTML = "";
    singers.forEach(singer => {
        let temp = `<option data-id="${singer.id}">${singer.name}</option>`;
        selector.innerHTML += temp;
    })
    tempSingerName = addMusicForm.selector.value;
    tempSingerID = getIdSinger();
    console.log({ tempSingerName, tempSingerID });
}
//get current select item
addMusicForm.selector.addEventListener("change", (e) => {
    tempSingerName = addMusicForm.selector.value;
    tempSingerID = getIdSinger();
    console.log({ tempSingerName, tempSingerID });
})

function getIdSinger() {
    let options = document.getElementsByTagName("option");
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
