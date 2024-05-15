// supabase.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://pahiqicgypbanlfepvpi.supabase.co';
const supabaseKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBhaGlxaWNneXBiYW5sZmVwdnBpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTU4MDUwMzUsImV4cCI6MjAzMTM4MTAzNX0.ydqB3NBZGuhL0i-ambVYAPa9uJyBaM9AY5Yqg4KU-rE';
export const supabase = createClient(supabaseUrl, supabaseKey);
