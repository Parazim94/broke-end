import { Error } from "../models/Error";
let count = 0;
const serverUpkeeper = async () => {
  setInterval(async () => {
    const response = fetch("https://broke-end.vercel.app/huhu");
    const newError = await Error.create({
      date: Date.now(),
      error: `count:${count}`,
    });
    count++;
  }, 300000);
};
export default serverUpkeeper;
