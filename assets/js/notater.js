/* ----------------------------
/*  Name: notater-firebase
    Author: Kimmie
    Version: 1
/* -------------------------- */

// HTML-elementer
const notecontainer = document.getElementById("notes");
const inp = document.querySelector("#inpNotattekst");

// Event-Lytter på input-feltet
inp.addEventListener("keyup", opretNotat); // eller "input"

const wsurl = "https://notatliste-b956e.firebaseio.com";

let dato = new Date().toLocaleString();

// ***** OPRET NOTAT *********************

function opretNotat(e) {
  // Hvis der er klikket på enter (=13)
  if (e.keyCode === 13) {
    // console.log(e.target.value);
    kaldWebserviceOpret(e.target.value);
    inp.value = "";
  }
}

function kaldWebserviceOpret(inp) {
  const nytnotat = { notat: inp, tid: dato };

  // POST
  fetch(wsurl + "/notater.json?auth=" + mintoken, {
    method: "POST",
    body: JSON.stringify(nytnotat)
  })
    .then(function() {
      console.log("OK");
      kaldWebserviceHentAlle();
    })
    .catch(function(error) {
      console.log(error);
    });
}

// Kald databasen når siden loader og vis alle notater fra Firebase på siden:
kaldWebserviceHentAlle();

//*************** LOGIN********/
let mintoken = null; // Token som vi får fra Firebase hvis Login godkendes

loginNu(); // Kald LoginNu funktionen

function loginNu() {
  fetch(
    "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyCGmYQxzBBNrmIanj_jkmfcqRgbqrUXHCA",
    {
      method: "POST",
      body: JSON.stringify({
        email: "kimm0961@videndjurs.net",
        password: "d7PCz4BC1F",
        returnSecureToken: true
      })
    }
  )
    .then(function(response) {
      return response.json();
    })
    .then(function(json) {
    //   console.log(json);
    mintoken = json.idToken;
    })
    .catch(function(error) {
      console.log(error);
    });
}

// ***** VIS ALLE NOTATER **************************

function kaldWebserviceHentAlle() {
  // GET
  fetch(wsurl + "/notater.json", {
    method: "GET"
  })
    .then(function(response) {
      return response.json();
    })
    .then(function(json) {
      udskrivNoter(json);
    })
    .catch(function(error) {
      console.log(error);
    });
}

function udskrivNoter(noterjson) {
  // console.log(noterjson)

  // Tøm tidligere indlæste notater for at undgå dubletter
  notecontainer.innerHTML = "";

  // Loop alle notater ind (ved pageload + efter opret, ret og slet)
  // Loop objektets keys igennem - altså ID'erne
  for (let id of Object.keys(noterjson)) {
    // Lav en <div class="note">...
    var notediv = document.createElement("div");
    notediv.className = "note";

    // Lav en <em> med dato

    var datop = document.createElement("em");
    datop.setAttribute("data-id", id);

    datop.innerHTML = noterjson[id].tid;

    // Lav en <p> med notattekst
    var p = document.createElement("p");
    p.setAttribute("data-id", id);
    p.setAttribute("contenteditable", "true");
    p.onkeydown = function(e) {
      // Hvis der klikkes på return/enter ..
      if (e.keyCode === 13) {
        e.preventDefault();
        kaldWebserviceRet(this, dato); // this = p som der er keyevents på
      }
    };
    p.innerHTML = noterjson[id].notat;

    // Lav <div> med sletsymbol
    var sletdiv = document.createElement("div");
    sletdiv.setAttribute("data-id", id);
    sletdiv.innerHTML = "&#9746;";
    sletdiv.onclick = function() {
      kaldWebserviceSlet(this.getAttribute("data-id"));
    };

    // Tilføj p til notediv
    notediv.appendChild(p);
    notediv.appendChild(datop);
    notediv.appendChild(sletdiv);

    // Tilføj notediv til div#notes
    notecontainer.appendChild(notediv);
  }
}

// ******* SLET NOTAT *************

function kaldWebserviceSlet(notatid) {
  // console.log("Der er klikket på slet - id = " + notatid);

  // DELETE
  fetch(wsurl + "/notater/" + notatid + ".json?auth=" + mintoken, {
    method: "DELETE"
  })
    .then(function() {
      kaldWebserviceHentAlle(); // Genindlæs indhold/noter så den slettede er væk
    })
    .catch(function(error) {
      console.log(error);
    });
}

// ***** RET NOTAT **************

function kaldWebserviceRet(p, d) {
  let notatid = p.getAttribute("data-id");
  let notattxt = p.innerHTML.replace("<br>", ""); // Fjern <br> fra teksten

  // console.log(notatid);
  // console.log(notattxt);

  let rettetnotat = { notat: notattxt, tid: d };

  // PUT
  fetch(wsurl + "/notater/" + notatid + ".json?auth=" + mintoken, {
    method: "PUT",
    body: JSON.stringify(rettetnotat)
  })
    .then(function() {
      kaldWebserviceHentAlle(); // Genindlæs indhold/noter nu med rettet note
    })
    .catch(function(error) {
      console.log(error);
    });
}
