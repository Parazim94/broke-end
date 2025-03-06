const serverUpkeeper = () => {
  setInterval(async () => {
    const response = await fetch(
      "https://timeapi.io/api/Time/current/zone?timeZone=Europe/Amsterdam"
    );
    const time = await response.json();
    console.log(time);
  }, 60000);
};
export default serverUpkeeper;
