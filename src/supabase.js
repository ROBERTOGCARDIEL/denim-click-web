import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://tzqiiwybteyvxhvfkdas.supabase.co/'
const supabaseKey = 'sb_publishable_1QO-ijB46anNpnhE8KkPEw_kce59V1e'

export const supabase = createClient(supabaseUrl, supabaseKey)