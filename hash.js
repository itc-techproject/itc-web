const bcrypt = require("bcryptjs");

(async () => {
  const hash = await bcrypt.hash("itc12345", 10);
  console.log(hash);
})();