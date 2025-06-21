export const config = {
  supabase: {
    url: process.env.VITE_SUPABASE_URL || 'https://ondhiytnuaauckvfylnx.supabase.co',
    anonKey: process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9uZGhpeXRudWFhdWNrdmZ5bG54Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0ODI4NTAsImV4cCI6MjA2NjA1ODg1MH0.6mHWDlFJblNZUKBgRjxmOzOZpl3tnG5s-22K2LSnE3E'
  },
  gemini: {
    apiKey: process.env.GEMINI_API_KEY || 'AIzaSyA5zP03tvRlmHTk7ZqJLHBy_U3Cp0p6ag8'
  },
  maps: {
    googleApiKey: process.env.GOOGLE_MAPS_API_KEY || 'AIzaSyDiNXT6lxm0UlH_eqApYog8_xTwDdohtN0',
    mapboxToken: process.env.MAPBOX_TOKEN || 'pk.eyJ1IjoiZGVlcDIwMDIiLCJhIjoiY21jNXNyaXE5MGw1MjJrc2E4aXlmYnE0aSJ9.fHP_xqOvP5QT7c8FsdI3UQ'
  },
  twitter: {
    apiKey: process.env.TWITTER_API_KEY || 'hvphDdSqRz81RLlQmGZICTs6i',
    apiSecret: process.env.TWITTER_API_SECRET || 'MpUay2eRdREDFRplcsP9YsCvUp7z701PL6eNIxfmGqxYrZr24u'
  }
};