import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jolrbccwafzgptbacqwv.supabase.co';
const supabaseKey = 'sb_publishable_5QhnHA3snxr_dDHtpyF48A_I2aWHN1I';
export const supabase = createClient(supabaseUrl, supabaseKey);
