window.onload = function() {
navigator.geolocation.getCurrentPosition(

position =>{
      const arrondirCoord = (coord, niveau) => {
      const precision = { pays: 0, region: 1, ville: 2 };
      const decimales = precision[niveau] ?? 2;
      return Number(coord).toFixed(decimales);
    };
	const lat = position.coords.latitude;
        const lon = position.coords.longitude;
      const latitude = arrondirCoord(lat, "ville");
      const longitude = arrondirCoord(lon, "ville");
alert(`Coordonnées (ville) : Latitude ${latVille}, Longitude ${lonVille}`);
	fetch(`https://api-adresse.data.gouv.fr/reverse/?lon=${longitude}&lat=${latitude}`)
    .then(response => response.json())
    .then(data => {
	    const city = data.features[0]?.properties?.city || "Ville non trouvée";
	    alert("https://api-adresse.data.gouv.fr/reverse/?lon=" + longitude + "&lat=" latitude);
      updatePrayerTimes(latitude, longitude);
    })
    .catch(err => {
      updatePrayerTimes(latitude, longitude);
    });
    },
error => {
      alert(latitude, longitude);
    }
);
};
function updatePrayerTimes(lat, lon) {
      const date = new Date();
      const timestamp = Math.floor(date.getTime() / 1000);

      fetch(`https://api.aladhan.com/v1/timings/${timestamp}?latitude=${lat}&longitude=${lon}&method=2`)
    .then(response => response.json())
    .then(data => {
      const timings = data.data.timings;
      const prayerList = document.getElementById("prayer-times");
      prayerList.innerHTML = `
        <li id="Fajr">Fajr : ${timings.Fajr}</li>
        <li id="Chourouk">Chourouk : ${timings.Sunrise}</li>
        <li id="Dhuhr">Dhuhr : ${timings.Dhuhr}</li>
        <li id="Asr">Asr : ${timings.Asr}</li>
        <li id="Maghrib">Maghrib : ${timings.Maghrib}</li>
        <li id="Isha">Isha : ${timings.Isha}</li>
      `;

      const prayerTimes = {
        "Fajr": timings.Fajr,
        "Chourouk": timings.Sunrise,
        "Dhuhr": timings.Dhuhr,
        "Asr": timings.Asr,
        "Maghrib": timings.Maghrib,
        "Isha": timings.Isha
      };

      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      let nextPrayer = "Fajr";
      let nextPrayerTime = 0;

      for (const [name, time] of Object.entries(prayerTimes)) {
        const [hour, minute] = time.split(":").map(Number);
        const totalMinutes = hour * 60 + minute;
        if (currentMinutes < totalMinutes) {
          nextPrayer = name;
          nextPrayerTime = totalMinutes;
          break;
        }
      }

      const nextElement = document.getElementById(nextPrayer);
        if (nextElement) {
          nextElement.classList.add("next");
        }
		
      const minutesUntilNext = nextPrayerTime - currentMinutes;
      if (minutesUntilNext === 5) {
      const nextElement = document.getElementById(nextPrayer);
        if (nextElement) {
		  nextElement.classList.remove("next");
          nextElement.classList.add("highlight");
        }		  
		document.getElementById("adhan-audio").play();
        if (Notification.permission === "granted") {
          new Notification("⏰ Prochaine prière", {
            body: `Il est presque l'heure de ${nextPrayer}`,
            icon: "https://cdn-icons-png.flaticon.com/512/2936/2936885.png"
          });
        }
      }
    })
    .catch(error => {
      console.error("Erreur lors du chargement des heures de prière :", error);
    });
}

function updateGregorianDate() {
  const gregorianDate = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  document.getElementById('gregorian-date').textContent = gregorianDate;
}

function updateHijriDate() {
  fetch("https://api.aladhan.com/v1/gToH?date=" + new Date().toLocaleDateString().replace(/\//g, '-').slice(0, 10))
    .then(response => response.json())
    .then(data => {
      const hijri = data.data.hijri;
      const hijriDate = `${hijri.weekday.ar} ${hijri.day} ${hijri.month.ar} ${hijri.year} هـ`;
      document.getElementById("hijri-date").textContent = hijriDate;
    })
    .catch(error => {
      console.error("Erreur lors du chargement de la date Hijri :", error);
      document.getElementById("hijri-date").textContent = "Erreur de date Hijri";
    });
}

function updateWeather() {
      const apiKey = "39bd9b6d4b623542cc218e97f9849151";
      const city = "Casablanca";
      const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric&lang=fr`;

  fetch(url)
    .then(response => response.json())
    .then(data => {
      const temp = data.main.temp.toFixed(1);
      const desc = data.weather[0].description;
      document.getElementById("weather-info").textContent = `${temp}°C - ${desc.charAt(0).toUpperCase() + desc.slice(1)}`;
    })
    .catch(error => {
      console.error("Erreur météo :", error);
      document.getElementById("weather-info").textContent = "Impossible de charger la météo.";
    });
}

function updateDouaa() {
  const douaas = [
    "اللهم إني أسألك العفو والعافية",
    "ربنا آتنا في الدنيا حسنة وفي الآخرة حسنة وقنا عذاب النار",
    "اللهم اجعلني من التوابين واجعلني من المتطهرين",
    "اللهم إني أعوذ بك من الهم والحزن والعجز والكسل"
  ];
  const randomIndex = Math.floor(Math.random() * douaas.length);
  document.getElementById("douaa-section").innerText = douaas[randomIndex];
}

function refreshAll() {
  updateGregorianDate();
  updateHijriDate();
  updateWeather();
  updateDouaa();
}

if ("Notification" in window && Notification.permission !== "granted") {
  Notification.requestPermission();
}

refreshAll();
setInterval(refreshAll, 600000); // toutes les 10 minutes
setInterval(success, 60000); // chaque minute
setInterval(updateDouaa, 60000); // chaque minute
