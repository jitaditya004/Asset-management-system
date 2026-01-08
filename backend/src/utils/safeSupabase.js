const supabase = require("../config/supabaseClient");

async function safeSupabase(run) {
  if (!supabase) {
    return {
      data: null,
      error: { message: "Supabase unavailable" },
    };
  }

  try {
    return await run(supabase);
  } catch (err) {
    console.error("❌ Supabase runtime error:", err.message);
    return {
      data: null,
      error: err,
    };
  }
}

module.exports = safeSupabase;
