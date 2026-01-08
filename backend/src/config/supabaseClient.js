// import { createClient } from "@supabase/supabase-js";

// export const supabase = createClient(
//   process.env.SUPABASE_URL,
//   process.env.SUPABASE_SERVICE_ROLE_KEY
// );


// const { createClient } = require("@supabase/supabase-js");

// const supabase = createClient(
//   process.env.SUPABASE_URL,
//   process.env.SUPABASE_SERVICE_ROLE_KEY
// );

// module.exports = supabase;


// const { createClient } = require("@supabase/supabase-js");

// let supabase = null;

// try {
//   if (
//     !process.env.SUPABASE_URL ||
//     !process.env.SUPABASE_SERVICE_ROLE_KEY
//   ) {
//     console.warn("⚠️ Supabase env vars missing. Storage disabled.");
//   } else {
//     supabase = createClient(
//       process.env.SUPABASE_URL,
//       process.env.SUPABASE_SERVICE_ROLE_KEY
//     );
//   }
// } catch (err) {
//   console.error("❌ Supabase init failed:", err.message);
// }

// module.exports = supabase;


const { createClient } = require("@supabase/supabase-js");

let supabase = null;

function initSupabase() {
  if (
    !process.env.SUPABASE_URL ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY
  ) {
    console.warn("⚠️ Supabase env vars missing. Supabase disabled.");
    return null;
  }

  try {
    return createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
  } catch (err) {
    console.error("❌ Supabase init failed:", err.message);
    return null;
  }
}

supabase = initSupabase();

module.exports = supabase;
