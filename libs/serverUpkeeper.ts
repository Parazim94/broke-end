const serverUpkeeper = () => {
  setInterval(async () => {
    const time = await fetch(
      "https://timeapi.io/api/Time/current/zone?timeZone=Europe/Amsterdam"
    );
    console.log(time);
  }, 120000);
};
export default serverUpkeeper;
