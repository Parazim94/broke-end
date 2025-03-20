const createPasssword = (): string => {
  const allowedChars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()";

  let newPassword = "";
  for (let i = 0; i < 8; i++) {
    newPassword += allowedChars.charAt(
      Math.floor(Math.random() * allowedChars.length)
    );
  }
  return newPassword;
};

export default createPasssword;
