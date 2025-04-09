import { createClient } from 'https://esm.sh/@supabase/supabase-js'

const supabaseUrl = 'https://ycxmcioxaewwqmakidqh.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InljeG1jaW94YWV3d3FtYWtpZHFoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQxNjY1NDUsImV4cCI6MjA1OTc0MjU0NX0.DiHveYOPNIVDxAUri9d_ntLSG3e_NiMBd7tiNsuE1CA'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)